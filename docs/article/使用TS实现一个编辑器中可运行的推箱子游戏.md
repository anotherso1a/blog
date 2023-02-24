# 使用TS实现一个编辑器中可运行的推箱子游戏

![img](https://dpubstatic.udache.com/static/dpubimg/RnKyvpBWDjqS6VDwmbiyb_894661677142708_.pic.jpg)
*图片来自网络

## 推箱子介绍

推箱子游戏的规则很简单，就是用你的人物把箱子推到指定的地方。游戏的地图是一个二维的网格，地图上有人物、箱子、墙壁等元素，人物可以向上下左右四个方向移动，箱子可以被人物推动，墙壁不能被穿过。

基本规则如下：

1. 箱子可以被玩家推动，但是不能被拽动。
2. 箱子前方有阻挡（墙、箱子等）时，无法推动。
3. 箱子数量和目标数量相等，当箱子完全覆盖目标时，则游戏目标达成，游戏获胜。

## 编辑器介绍

常用的支持TS的编辑器有：[VSCode](https://code.visualstudio.com/)、[WebStorm](https://www.jetbrains.com/webstorm/)、[Sublime Text](https://www.sublimetext.com/)、[Atom](https://atom.io/)等。本项目使用最贴合TS的编辑器 VSCode 进行编写。

要使玩家能和编辑器进行交互，同时保证玩家操作的可预测性，本项目采用了编辑器的**代码提示**能力。

本项目的代码提示功能基于TS的类型系统，通过TS的类型系统，我们可以在编辑器中自定义代码片段，然后在编辑器中输入一段代码，编辑器会自动提示出自定义的代码片段。

例如：

```ts
interface Person {
  age: number
  name: string
}

let a: Person = {
  age: 18,
  name: 'Jack'
}

// 当用户键入： a. 时，编辑器会根据我们定义好的Person类型枚举出可能的属性值
```

效果如图：

![](https://dpubstatic.udache.com/static/dpubimg/5xerkdEOd4Vmjnuss7P5f.png)

基于此特性，结合一些简单的**类型编辑**，即可通过**代码提示**，编写出一个简单可玩的推箱子游戏了～

## 代码实现


### 元素介绍

枚举出推箱子中所有的游戏元素，我们可以得到：**角色、墙体、空地、箱子、目标点**等基础元素，以及游玩过程中，**箱子和目标点重合、玩家和目标点重合**都会产生新的元素，一共是7种元素：

```ts
type Tree = '🌲' // 没找到合适的emoji，使用树来代替墙壁好了，大多数游戏中树也是无法穿越的～
type Blank = '🌫️' // 空地
type Box = '📦' // 箱子
type Boom = '💣' // 目标点，做成炸弹，有危机感
type Player = '🌝' // 玩家本体
type BoxIn = '🎆' // 使用箱子盖住炸弹的元素
type PlayerOn = '🌚' // 玩家站在炸弹上时变黑，用于区分玩家站在空地上时的状态

// 元素集合的联合类型
type Symbols = BoxIn | Tree | Player | Box | Boom | Blank | PlayerOn
```

### 关卡设计

直接复用经典第一关，使用二维元组类型定义。当然，只要是矩形，都可以自行编辑关卡(仅受限于ts的运算上限)。

```ts
export type Level1 = [
  ['🌫️', '🌲', '💣', '🌲', '🌫️', '🌫️'],
  ['🌫️', '🌲', '🌫️', '🌲', '🌲', '🌲'],
  ['🌲', '🌲', '📦', '📦', '🌫️', '💣'],
  ['💣', '🌫️', '📦', '🌝', '🌲', '🌲'],
  ['🌲', '🌲', '🌲', '📦', '🌲', '🌫️'],
  ['🌫️', '🌫️', '🌲', '💣', '🌲', '🌫️']
]
```

### 打印

理想情况下，我们想要直接显示整个地图，比方说像这个样子：

```node
🌫️🌲💣🌲🌫️🌫️
🌫️🌲🌫️🌲🌲🌲
🌲🌲📦📦🌫️💣
💣🌫️📦🌝🌲🌲
🌲🌲🌲📦🌲🌫️
🌫️🌫️🌲💣🌲🌫️
```

遗憾的是目前还无法做到直接打印整个地图，因为在很多代码规范中，换行表示了一段code的结束，代码提示中几乎不可能出现带换行符的自动补全。

折中的办法是一行一行的进行输出，可以参考以下代码：

```ts
interface Poem {
  鹅鹅鹅: {
    曲项向天歌: {
      白毛浮绿水: {
        红掌拨清波: never
      }
    }
  }
}

const poem: Poem
// 输入 poem. 时，后续的诗句会逐行提示
```

效果如下：

![](https://dpubstatic.udache.com/static/dpubimg/AZojpn0i3fjFiLeUP4gtD.png)

#### 处理Level

以上《咏鹅》的例子中，由于每一句诗句本质上都是`string`，所以直接转成嵌套对象即可，对于`Level`这样的**二维元组**类型，我们需要将二为元组中的每一个元组都先处理成字符串，再通过将处理好的字符串元组处理成嵌套的对象进行输出。

##### 元组转字符串

为了将元组类型转为字符串类型，我们编写了以下方法：

```ts
// 将元组转为字符串类型
type TupleToString<T extends string[], Result extends string = '', Counter extends any[] = []> =
  Counter['length'] extends T['length']
    ? Result
    : TupleToString<T, `${Result}${T[Counter['length']]}`, [...Counter, unknown]>
```

方法有三个参数，分别是：**元组、结果、计数器**，使用时仅需传入元组即可。结果和字符串都有默认值，这是一种在TS类型方法中常用的定义变量的方式（因为TS类型方法本身没有定义语句，所以只能在参数中去定义）。

该方法执行时，先判断计数器的length和元组长度是否相等 `Counter['length'] extends T['length']` ，如果相等，则表示已经处理完所有元组中的元素，返回拼接好的结果（`Result`）即可，否则，递归调用 `TupleToString` 方法，但是会往结果参数中拼接元组的元素，同时将计数器的长度+1: ```TupleToString<T, `${Result}${T[Counter['length']]}`, [...Counter, unknown]>```

```ts
type Line = TupleToString<['💣', '🌫️', '📦', '🌝', '🌲', '🌲']>
//    ^ "💣🌫️📦🌝🌲🌲"
```

**\*这种递归的处理方式在数组的一些类型方法中也是十分常见的：**
```ts
// 定长数组
type FixedLengthArray<T, N extends number, R extends unknown[] = []> =
  R['length'] extends N
    ? R
    : FixedLengthArray<T, N, [T, ...R]>;
type FixedStringArray = FixedLengthArray<string, 3> // [string, string, string]

// 数组 indexOf 方法
type IndexOf<T extends any[], S, Counter extends any[] = []> =
  T[0] extends S
    ? Counter['length']
    : T extends [any, ...infer L]
      ? IndexOf<L, S, [...Counter, unknown]>
      : -1
type Index = IndexOf<['a', 'b', 'c'], 'b'> // 1
```

> *但这类方法由于是通过递归实现的，当处理的数据量过大时也会引起TS的报错: 类型实例化过深，且可能无限。ts(2589)。参考：https://github.com/microsoft/TypeScript/issues/35156
> 所以慎重使用。

##### 元组转嵌套对象

当把每一列的元组都转为字符串之后，我们需要将转换后的元组继续转换为上文《咏鹅》中类似格式的嵌套对象：

```ts
type Render<T, R extends any[] = []> = T extends Symbols[][]
  ? T['length'] extends R['length']
    ? never
    : { [K in TupleToString<T[R['length']]>]: Render<T, [...R, unknown]> }
  : never
```

`Render`方法同样使用了**递归**的处理方式，通过不断返回对象类型和递归调用，最后生成一个完整的嵌套对象：

![](https://dpubstatic.udache.com/static/dpubimg/bD3TyVj3iXOaSdmLfJSI7.png)

> *ts-ignore 忽略掉的报错内容为：`表达式生成的联合类型过于复杂，无法表示。ts(2590)`
> 复杂的原因是在 in 操作符后使用了 TupleToString 方法，而该方法会递归调用，虽然最终结果是一个字符串，但ts似乎并不会提前解析。
> 好在即使是出现了这个错误，在实际类型推导中依旧能正确推导出具体类型。


### 游戏逻辑处理

经过以上步骤，我们已经能正常的“渲染”地图了，为了使游戏可被操作，我们需要能够判断玩家的行动以及行动后游戏发生的变化。

在推箱子游戏中，当玩家移动时，游戏中会发生变化的仅仅**只有玩家运动时所在的一行**。所以，在玩家移动之后，我们仅仅只需要改变这一行的类型即可。

先考虑横向移动的情况，也就是在元组中进行前后移动。

简单编写一个可移动的demo：

```ts
type Line = ['🌝', '🌫️', '🌫️', '🌫️', '🌫️', '🌫️']

type Move<T extends Symbols[], P extends number> = {
  [K in keyof T]: K extends `${P}` ? '🌝' : '🌫️'
}

type Line2 = Move<Line, 1> // ["🌫️", "🌝", "🌫️", "🌫️", "🌫️", "🌫️"]
```

可以注意到，在判断`index`时，我们使用了 ``` K extends `${P}` ``` 这种方式。是因为在遍历数组的过程中，数组的 `index` 会被当作字符串解析出来，针对这一情况，我们可以引入 `ToNumber` 方法来处理：

```ts
// 从字符串类型中推导出number类型
// @see https://github.com/microsoft/TypeScript/issues/42938
type ToNumber<T extends any> = T extends `${infer Result extends number}` ? Result : never
// 上述Move可改为写为：
type Move<T extends Symbols[], P extends number> = {
  [K in keyof T]: ToNumber<K> extends P ? '🌝' : '🌫️'
}
```

>`infer Result extends number` 中，在 `infer` 语句后追加 `extends` 作为限制条件的语法最早出现在 [TS-4.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html)版本中。在4.8中，可以通过在 `infer` 后继续添加 `extends` 来限定需要推导的类型，同时会将对应的 `infer` 变量缩窄为此类型，十分好用。

#### 交互处理

在上面例子中，我们实际上是重排了整个元组，通过传递位置的 `index` 使人物出现在对应地方，但实际上要做的工作远不止如此。但在TS的类型操作中，重新生成整个元组比操作原有元组进行更改显然更容易实现，成本也更低。

通过分析游戏和玩家行为，我们可以整理出：

- **玩家在空地中移动时，会发生改变的只有玩家原本所在的格子和即将要去往的格子**
- **玩家推动箱子时，会发生改变的有：玩家原本所在的格子、箱子原本所在的格子和箱子前方一格**

综上，不管是向前还是向后移动，影响范围最大也只有前进方向的2格距离，但由于需要考虑玩家的前后移动，所以我们需要知道玩家前后2格内的所有元素，并根据元素特性，计算出与玩家交互后的结果。

由于在TS类型中是**不存在四则运算**的，所以我们采用最原始的阵列运算方式，直接定义可能的运算结果：

```ts
// 阵列运算
type Minus1Table = [-1, 0, 1, 2, 3, 4, 5]
type Minus2Table = [-2, -1, 0, 1, 2, 3, 4]
type Plus1Table = [1, 2, 3, 4, 5, 6, 7]
type Plus2Table = [2, 3, 4, 5, 6, 7, 8]

type Minus1<T extends number> = Minus1Table[T]
type Minus2<T extends number> = Minus2Table[T]
type Plus1<T extends number> = Plus1Table[T]
type Plus2<T extends number> = Plus2Table[T]

type A = Minus1<5> // 5 - 1 = 4
type B = Minus2<5> // 5 - 2 = 3
type C = Plus1<2> // 2 + 1 = 3
```

举例的地图大小为 `6 * 6`， 所以此处的阵列运算长度为`7`，则 0 - 6 的 `+1` `+2` `-1` `-2` 运算皆可直接得出结果。但后续如果需要设计更大的地图，此处阵列运算的长度应被扩展。

基于阵列运算，我们可以建立以元素为中心，前后2格的观察对象：

```ts
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
```

传入元素所在的行以及元素的`index`，即可知道**元素前后两格**内所有元素信息。

根据元素信息以及玩家前进or后退来重新生成当前列：

```ts
// 控制中心返回类型
interface ControlIns {
  '1': Symbols
  '2': Symbols
  '-1': Symbols
  '-2': Symbols
  '0': Symbols
}
// 重新渲染当前元素
type RerenderSymbols<T extends ControlIns> = {
  '🎆': MoveBoxIn<T>
  '🌲': '🌲' // 树类似于墙体，永不移动
  '🌝': MovePlayer<T>
  '📦': MoveBox<T>
  '💣': MoveBoom<T>
  '🌫️': MoveBlank<T>
  '🌚': MovePlayerOn<T>
}[T['0']]

type ProcessLine<T extends Symbols[], D extends 'foward' | 'back'> = {
  [K in keyof T]: ToNumber<K> extends number ? RerenderSymbols<D extends 'foward' ? ControlFoward<T, ToNumber<K>> : ControlBack<T, ToNumber<K>>> : T[K]
}
```

使用 `ProcessLine` 来处理需要重新渲染的行（也就是玩家所在的行），我们定义往右为 `foward`（前进），向左为 `back`（后退）。

```ts
type Line = ['💣', '🌫️', '📦', '🌝', '🌲', '🌲']

type Line2 = ProcessLine<Line, 'back'> // ["💣", "📦", "🌝", "🌫️", "🌲", "🌲"]
```

很神奇，可以看到玩家可以推着箱子行进了。在 `RerenderSymbols` 类型方法中，我们枚举了每种元素被重新渲染的方式，🌲 是最简单的，因为它永远不会发生变化。对于其他元素，这里浅举一些处理方式，具体实现细节可以查看源码。

```ts
// 根据元素的一些相同特性，定义了一些类型集合，比如 '🌝' | '🌚' 其实都有 Player 的特性，'🌫️' | '💣' 也都具有空地属性。
type PlayerLike = '🌝' | '🌚'
type BoxLike = '📦' | '🎆'
type BlankLike = '🌫️' | '💣'
type TreeLike = '🌲' | undefined // undefined为边界，也不可推动和进入

// 处理 '📦' 的移动，返回移动后当前格显示的内容
type MoveBox<T extends ControlIns> = 
  // 后方是Player时，才会向前移动
  T['-1'] extends PlayerLike
    // 前进，根据游戏条件，在前方只有可能是 '🎆''🌲''📦''💣''🌫️'
    ? T['1'] extends TreeLike | BoxLike // 前方不可推行
        ? T['0'] // 保持不动
        // : T['1'] extends Blank | Boom // 前面可推行
        : Player
    : T['0']

// 处理 '🌫️' 的移动，返回移动后当前格显示的内容
type MoveBlank<T extends ControlIns> = 
  // blank本身无法移动，只需要判断后方来物并且更新当前内容即可
  T['-1'] extends PlayerLike // 后方是玩家
    ? Player // 则展示玩家站在blank中的样子
    //! 类似于 && 条件符
    : [T['-1'], T['-2']] extends [BoxLike, PlayerLike] // 后方是箱子+Player的组合，组合判断一下
      ? Box // 是则表示箱子会被推动，展示箱子进洞的样子
      : T['0'] // 其他情况则保持原样
```

*在 📦 的逻辑中，只有当它后方一格是 🌝 | 🌚 在推时，才可能会发生变化，所以当不符合条件时直接返回 📦 即可。即使 📦 后方是 `Player`，**📦 前方有阻挡时依旧不可移动**，所以还需要二次判断前一格是否是 🎆、🌲、📦 或是边界，如果是则依旧无法推动。其他情况则表明可以被推动，当 📦 被推动之后，箱子之前所在的地方一定会是 🌝，所以返回 🌝 即可。

*同理，在 🌫️ 的逻辑中，如果后方是 🌝 ，则 🌝 会顺利进入 🌫️ ，之后会显示 🌝。当后方是 📦 ，且后方第二格是 🌝 时，则箱子也会顺利进入 🌫️ ，之后展示的则是 📦。对于其他情况，🌫️ 都不会发生任何改变，直接返回 🌫️ 即可。

可以看到在 `MoveBlank` 中有 `[T['-1'], T['-2']] extends [BoxLike, PlayerLike]` 这样的判断，对于一些并列条件，在TS中可以直接组合成元组进行 `extends` 判断。

比如**想判断 A 为 1，B 为 2，符合条件则返回true，不符合则返回false**，一般的写法是：

```ts
type Result = A extends 1
  ? B extends 2
    ? true
    : false
  : false
```

合并后可以写为：

```ts
type Result = [A, B] extends [1, 2] ? true : false
```

#### 玩家的纵向移动

经过上述交互处理的逻辑编写之后，我们完全实现了对行的重新渲染，但纵向运动会影响到玩家所在行的上下2格所有的行。如果使用正常逻辑处理，此时将十分棘手。

这里可以使用到一个**翻转二维元组行和列**的方法，这样我们在对纵向移动进行处理时，即可完整的复用之前编写的横向移动逻辑。

为了使纵向运动能够复用横向运动逻辑，我们需要改变原有二维元组的横纵坐标。

```ts
// 获取Level的一列
type GetLine<T extends Symbols[][], I extends number> = {
  [K in keyof T]: T[K][I]
}
// 使Level行列互换
type FlipLevel<T extends Symbols[][], N extends number = T[0]['length'], R extends any[] = []> =
  R['length'] extends N
    ? R 
    : FlipLevel<T, N, [...R, GetLine<T, R['length']>]>
```

`GetLine` 方法接受二维元组和索引作为参数，通过取出二维元组每一项的对应索引，并作为值填充，即可将二维元组打平为含义为列的一维元组：

```ts
// 获取二维元组 Level1 的 索引为 0 的列
type Line0 = GetLine<Level1, 0> // ["🌫️", "🌫️", "🌲", "💣", "🌲", "🌫️"]
```

`FlipLevel` 同样使用了很常见的递归处理方式，这种方式虽然简单粗暴但是会有栈溢出的风险，但如果想根据关卡动态的去进行行列互换，也只有此方法可行，另一种方式是针对同样大小的正方形地图，使用枚举的方式去完成，这样TS会处理的少一些：

```ts
// 使Level行列互换
type FlipLevel<T extends Symbols[][]> = [
  GetLine<T, 0>,
  GetLine<T, 1>,
  GetLine<T, 2>,
  GetLine<T, 3>,
  GetLine<T, 4>,
  GetLine<T, 5>
]
```

根据前面提到的方法，我们可以定义玩家的向左和向右的行为发生之后，产生的新的游戏地图：

```ts
// 更新整个地图
type ProcessFrame<T extends Symbols[][], D extends 'foward' | 'back'> = {
  [K in keyof T]: Player extends T[K][number]
    ? ProcessLine<T[K], D> // 只有玩家所在的行会被更新
    : PlayerOn extends T[K][number]
      ? ProcessLine<T[K], D> // 只有玩家所在的行会被更新
      : T[K] // 其他行保持不变即可
}

type Left<T extends Symbols[][]> = ProcessFrame<T, 'back'>
type Right<T extends Symbols[][]> = ProcessFrame<T, 'foward'>
```

引入 `FlipLevel` 之后，我们可以这样定义玩家的向上和向下的行为：

```ts
type Up<T extends Symbols[][]> = FlipLevel<ProcessFrame<FlipLevel<T>, 'back'>>
type Right<T extends Symbols[][]> = FlipLevel<ProcessFrame<FlipLevel<T>, 'foward'>>
```

在使整个游戏地图重绘的 `ProcessFrame` 方法中，我们便利二维元组的每一行，通过 `Player extends T[K][number]` 和 `PlayerOn extends T[K][number]` 来判断当前行是否存在玩家，如果存在玩家则调用 `ProcessLine` 对当前行进行重绘，否则保持原样。

对于玩家的上下移动，我们先使用 `FlipLevel` 将关卡的**行列互换**，之后使用和处理行一样的逻辑来处理纵向移动，在前面，我们定义了向左，也就是 `index` 减小的方向为 `back`，`index` 增大的方向为 `foward`，所以对于玩家的向上移动，对应的列的 `index` 在减小，所以方向为 `back`，向下移动方向为 `foward`。翻转关卡并处理完玩家移动之后，为了能正常使用 `Render` 方法渲染，我们需要**再次**使用 `FlipLevel` 方法将行列互换回来。

#### 通关验证

在关卡设计合理的前提下，当所有的 📦 元素消失时，则说明均已移动至目标点，此时游戏胜利。改写上述 `Render` 方法，增加游戏通关的校验：

```ts
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

type IsGamePassed<T extends Symbols[][]> = '📦' extends T[number][number] ? false : true
```

*关于卡关OR游戏失败：

>因为游戏的每一帧都出现在之前的输出中，如果发现不对，随时可以删除走错的路径进行回溯。所以游戏不存在失败或者卡关，只有未完成而已～

#### 整合代码

所有的游戏逻辑处理和渲染逻辑均已完成，接下来只需要组装好、导出即可进行游玩：

```ts
interface Game<T extends Symbols[][]> {
  Left: Render<ProcessFrame<T, 'back'>>
  Right: Render<ProcessFrame<T, 'foward'>>
  // @ts-ignore
  Up: Render<FlipLevel<ProcessFrame<FlipLevel<T>, 'back'>>>
  // @ts-ignore
  Down: Render<FlipLevel<ProcessFrame<FlipLevel<T>, 'foward'>>>
}

export type GameStart<T extends Symbols[][]> = Render<T>
```

定义变量且使用类型即可进行游玩，例如：

```ts
let game: GameStart<Level1>

game
["🌫️🌲💣🌲🌫️🌫️"]
["🌫️🌲🌫️🌲🌲🌲"]
["🌲🌲📦📦🌫️💣"]
["💣🌫️📦🌝🌲🌲"]
["🌲🌲🌲📦🌲🌫️"]
["🌫️🌫️🌲💣🌲🌫️"]
```

但是以上代码中game会报错：在变量赋值前使用了该变量。**作为严谨的程序员是不允许这种错误出现的**，所以封装成函数进行使用，来避免报错：

```ts
import { GameStart } from "./game";
import { Level0, Level1, Level2 } from "./levels";

const start = () => 1 as unknown as GameStart<Level1>

start()
["🌫️🌲💣🌲🌫️🌫️"]
["🌫️🌲🌫️🌲🌲🌲"]
["🌲🌲📦📦🌫️💣"]
["💣🌫️📦🌝🌲🌲"]
["🌲🌲🌲📦🌲🌫️"]
["🌫️🌫️🌲💣🌲🌫️"]
```

截止目前，整理了三个有代表性的关卡，Level0 为原创，主要为了完整体现游戏特性：

```ts
export type Level0 = [
  ['🌫️', '🌫️', '🌲', '🌲', '🌲', '🌲'],
  ['🌲', '🌲', '🌲', '🌫️', '🌫️', '🌫️'],
  ['💣', '💣', '📦', '🌝', '📦', '🌫️'],
  ['🌲', '🌲', '🌲', '🌲', '🌲', '🌲']
]

export type Level1 = [
  ['🌫️', '🌲', '💣', '🌲', '🌫️', '🌫️'],
  ['🌫️', '🌲', '🌫️', '🌲', '🌲', '🌲'],
  ['🌲', '🌲', '📦', '📦', '🌫️', '💣'],
  ['💣', '🌫️', '📦', '🌝', '🌲', '🌲'],
  ['🌲', '🌲', '🌲', '📦', '🌲', '🌫️'],
  ['🌫️', '🌫️', '🌲', '💣', '🌲', '🌫️']
]

export type Level2 = [
  ['🌫️', '🌫️', '🌝', '🌲', '🌫️', '🌫️', '🌫️'],
  ['🌫️', '📦', '📦', '🌲', '🌫️', '🌲', '🌲'],
  ['🌫️', '📦', '🌫️', '🌲', '🌫️', '🌲', '💣'],
  ['🌲', '🌲', '🌫️', '🌲', '🌲', '🌲', '💣'],
  ['🌲', '🌲', '🌫️', '🌫️', '🌫️', '🌫️', '💣'],
  ['🌲', '🌫️', '🌫️', '🌫️', '🌲', '🌫️', '🌫️'],
  ['🌲', '🌫️', '🌫️', '🌫️', '🌲', '🌲', '🌲']
]
```

完整实例见：https://github.com/anotherso1a/blog/tree/master/examples/ts-box-game

## 游玩实况

<video src="../../assets/video_ts_box_game.mp4"></video>

> 除了有点费手之外还ok..

## 参考

1. `ToNumber`方法： https://github.com/microsoft/TypeScript/issues/42938
2. 使用 `extends` 限定 `infer` 类型： https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html
3. 关于TS中递归报错： https://github.com/microsoft/TypeScript/issues/35156
4. 阵列编程： https://zh.wikipedia.org/zh-hans/%E9%98%B5%E5%88%97%E7%BC%96%E7%A8%8B
5. 推箱子： https://zh.wikipedia.org/zh-sg/%E5%80%89%E5%BA%AB%E7%95%AA
