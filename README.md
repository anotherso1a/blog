# blog

## 文章

1、[VueCLI3.x中接入Lottie动画.md](article/VueCLI3.x中接入Lottie动画.md)

2、[使用Typescript新特性Template-Literal-Types完善链式key的类型推导.md](article/使用Typescript新特性Template-Literal-Types完善链式key的类型推导.md)

3、[活动项目的前端工程化实践1.md](article/活动项目的前端工程化实践1.md)

<script>
window.onload = () => {
  var emoji = [
    '(•̤̀ᵕ•̤́๑)ᵒᵏᵎᵎᵎᵎ',
    'Ծ‸Ծ',
    '⚆_⚆',
    '(⑉꒦ິ^꒦ິ⑉)',
    '(๑◕ܫ￩๑)b',
    '(;-_-)ᴇᴍᴍᴍ',
    'ᴴᴱᴸᴸᴼ',
    '(๓˙ϖ˙๓)',
    '(⁼̴̀д⁼̴́)',
    'ଘˊᵕˋଓ',
    '(๑´ㅂ`๑)',
    'ଲ',
    'ଇ',
    'ଉ',
    'କ',
    '•́.•̀',
    '･ᴗ･',
    'нёιιö',
    '꒰⑅•ᴗ•⑅꒱'
  ]
  var color = [
    "#993333",
    "#CC9966",
    "#003300",
    "#FF0033",
    "#333399",
    "#CCCC00",
    "#CC0033",
    "#000000",
    "#003399"
  ]

  document.addEventListener('click', e => {
    let text = document.createElement('div')
    console.log(e)
    let x = e.x
    let y = e.y
    let emj = emoji[Math.floor(Math.random() * emoji.length)]
    let c = color[Math.floor(Math.random() * color.length)]
    text.textContent = emj
    location.hash = emj
    text.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
      color: ${c};
      top: ${y - 6}px;
      left: ${x}px;
      opacity: 1;
      transition: all 0.5s ease;
    `
    document.body.append(text)
    setTimeout(() => {
      text.style.cssText = `
        position: fixed;
        pointer-events: none;
        transform: translate(-50%, -50%);
        color: ${c};
        z-index: 1000;
        top: ${y - 56}px;
        left: ${x}px;
        opacity: 0;
        transition: all 0.5s ease;
      `
      setTimeout(() => {
        text.remove()
      }, 500)
    }, 200)
  })
}
</script>
