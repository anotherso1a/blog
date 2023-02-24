type BoxIn = '🎆'
type Tree = '🌲'
type Player = '🌝'
type Box = '📦'
type Boom = '💣'
type Blank = '🌫️'
type PlayerOn = '🌚'

type Symbols = BoxIn | Tree | Player | Box | Boom | Blank | PlayerOn

// 将元组转为字符串类型
type TupleToString<T extends string[], Result extends string = '', Counter extends any[] = []> =
  Counter['length'] extends T['length']
    ? Result
    : TupleToString<T, `${Result}${T[Counter['length']]}`, [...Counter, unknown]>


// 获取Level的一列
type GetLine<T extends Symbols[][], I extends number> = {
  [K in keyof T]: T[K][I]
}

// 使Level行列互换
// type FlipLevel<T extends Symbols[][]> = [
//   GetLine<T, 0>,
//   GetLine<T, 1>,
//   GetLine<T, 2>,
//   GetLine<T, 3>,
//   GetLine<T, 4>,
//   GetLine<T, 5>
// ]

// 使Level行列互换
type FlipLevel<T extends Symbols[][], N extends number = T[0]['length'], R extends any[] = []> =
  R['length'] extends N
    ? R 
    : FlipLevel<T, N, [...R, GetLine<T, R['length']>]>

// 阵列运算
type Minus1Table = [-1, 0, 1, 2, 3, 4, 5]
type Minus2Table = [-2, -1, 0, 1, 2, 3, 4]
type Plus1Table = [1, 2, 3, 4, 5, 6, 7]
type Plus2Table = [2, 3, 4, 5, 6, 7, 8]

type Minus1<T extends number> = Minus1Table[T]
type Minus2<T extends number> = Minus2Table[T]
type Plus1<T extends number> = Plus1Table[T]
type Plus2<T extends number> = Plus2Table[T]


/**
 * 将 '1' 转为 1
 * 在ts推导中，如果对array进行遍历，其索引类型会被推导为 number | `${number}`
 * 但是在实际使用中，我们无法将 `${number}` 直接作为index使用或者作为number
 * 虽然直接使用 `${number}` 作为index可以运行正确，但是在ts推导中会报错
 * https://github.com/microsoft/TypeScript/issues/42938
 */
type ToNumber<T extends any> = T extends `${infer Result extends number}` ? Result : never


// 控制向前
type ControlFoward<T extends Symbols[], K extends number> = {
  '1': T[Plus1<K>],
  '2': T[Plus2<K>],
  '-1': T[Minus1<K>],
  '-2': T[Minus2<K>],
  '0': T[K]
}

// 控制向后
type ControlBack<T extends Symbols[], K extends number> = {
  '1': T[Minus1<K>],
  '2': T[Minus2<K>],
  '-1': T[Plus1<K>],
  '-2': T[Plus2<K>],
  '0': T[K]
}

// 控制中心返回类型
interface ControlIns {
  '1': Symbols
  '2': Symbols
  '-1': Symbols
  '-2': Symbols
  '0': Symbols
}

type RerenderSymbols<T extends ControlIns> = {
  '🎆': MoveBoxIn<T>
  '🌲': '🌲' // 树类似于墙体，永不移动
  '🌝': MovePlayer<T>
  '📦': MoveBox<T>
  '💣': MoveBoom<T>
  '🌫️': MoveBlank<T>
  '🌚': MovePlayerOn<T>
}[T['0']]


type PlayerLike = Player | PlayerOn
type BoxLike = Box | BoxIn
type BlankLike = Blank | Boom

// 处理 '🎆' 的移动，返回移动后当前格显示的内容
type MoveBoxIn<T extends ControlIns> = 
  // 后方是Player且前方是空地时，才会向前移动
  //! 类似于 && 条件符
  [T['-1'], T['1']] extends [PlayerLike, BlankLike]
    // 前进，根据游戏条件，在前方只有可能是 '🎆''🌲''📦''💣''🌫️'
    ? PlayerOn // 前方可推行
    : T['0'] // 保持不动

// 处理 '📦' 的移动，返回移动后当前格显示的内容
type MoveBox<T extends ControlIns> = 
  // 后方是Player且前方是空地时，才会向前移动
  [T['-1'], T['1']] extends [PlayerLike, BlankLike]
    ? Player
    : T['0'] // 保持不动

// 处理 '🌝' 的移动，返回移动后当前格显示的内容
type MovePlayer<T extends ControlIns> = 
  // 判断前方是否可移动
  T['1'] extends BlankLike
    ? Blank
    : [T['1'], T['2']] extends [BoxLike, BlankLike] // 判断前方有可推物 且 更前方无阻挡
      ? Blank // 没有则推动成功，原地变空地
      : T['0'] // 其他情况，如墙体，地图边缘等，无法移动，保持不变

// 处理 '🌚' 的移动，返回移动后当前格显示的内容
type MovePlayerOn<T extends ControlIns> = 
  // 判断前方是否可移动
  T['1'] extends BlankLike
    ? Boom
    : [T['1'], T['2']] extends [BoxLike, BlankLike] // 判断前方有可推物 且 更前方无阻挡
      ? Boom // 没有则推动成功，原地变空地
      : T['0'] // 其他情况，如墙体，地图边缘等，无法移动，保持不变

// 处理 '💣' 的移动，返回移动后当前格显示的内容
type MoveBoom<T extends ControlIns> = 
  // Boom本身无法移动，只需要判断后方来物并且更新当前内容即可
  T['-1'] extends PlayerLike // 后方是玩家
    ? PlayerOn // 则展示玩家站在Boom中的样子
    : [T['-1'], T['-2']] extends [BoxLike, PlayerLike] // 后方是箱子+Player的组合，组合判断一下
      ? BoxIn // 是则表示箱子会被推动，展示箱子进洞的样子
      : T['0'] // 其他情况则保持原样

// 处理 '🌫️' 的移动，返回移动后当前格显示的内容
type MoveBlank<T extends ControlIns> = 
  // blank本身无法移动，只需要判断后方来物并且更新当前内容即可
  T['-1'] extends PlayerLike // 后方是玩家
    ? Player // 则展示玩家站在blank中的样子
    : [T['-1'], T['-2']] extends [BoxLike, PlayerLike] // 后方是箱子+Player的组合，组合判断一下
      ? Box // 是则表示箱子会被推动，展示箱子进洞的样子
      : T['0'] // 其他情况则保持原样

type ProcessLine<T extends Symbols[], D extends 'foward' | 'back'> = {
  [K in keyof T]: ToNumber<K> extends number ? RerenderSymbols<D extends 'foward' ? ControlFoward<T, ToNumber<K>> : ControlBack<T, ToNumber<K>>> : T[K]
}

type ProcessFrame<T extends Symbols[][], D extends 'foward' | 'back'> = {
  [K in keyof T]: Player extends T[K][number]
    ? ProcessLine<T[K], D>
    : PlayerOn extends T[K][number]
      ? ProcessLine<T[K], D>
      : T[K]
}

type Render<T, R extends any[] = []> = T extends Symbols[][]
  ? T['length'] extends R['length']
    ? IsGamePassed<T> extends true
      ? {
        '恭喜过关': {
          '🎉🎉🎉🎉🎉': never
        }
      }
      : Game<T>
      // @ts-ignore
    : { [K in TupleToString<T[R['length']]>]: Render<T, [...R, unknown]> }
  : never

type IsGamePassed<T extends Symbols[][]> = Box extends T[number][number] ? false : true


interface Game<T extends Symbols[][]> {
  Left: Render<ProcessFrame<T, 'back'>>
  Right: Render<ProcessFrame<T, 'foward'>>
  // @ts-ignore
  Up: Render<FlipLevel<ProcessFrame<FlipLevel<T>, 'back'>>>
  // @ts-ignore
  Down: Render<FlipLevel<ProcessFrame<FlipLevel<T>, 'foward'>>>
}

export type GameStart<T extends Symbols[][]> = Render<T>
