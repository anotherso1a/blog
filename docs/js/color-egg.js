window.__emoji = [
  "❆",
  "˶‾᷄ꈊ‾᷅˵",
  "꒰⑅•ᴗ•⑅꒱",
  "(•̤̀ᵕ•̤́๑)ᵒᵏᵎᵎᵎᵎ",
  "(ง ˙o˙)ว",
  "Ծ‸Ծ",
  "⚆_⚆",
  "(⑉꒦ິ^꒦ິ⑉)",
  "(๑◕ܫ￩๑)b",
  "(๛ᴛ ʏ ᴛ) =͟͟͞͞",
  "(;-_-)ᴇᴍᴍᴍ",
  "ฅ(๑ ̀ㅅ ́๑)ฅ",
  "ᴴᴱᴸᴸᴼ",
  "(๓˙ϖ˙๓)",
  "Σ( ⚆൧⚆)",
  "(๑> ₃ <)",
  "꒰๑• ̫•๑꒱ ♡",
  "(⁼̴̀д⁼̴́)",
  "ଘˊᵕˋଓ",
  "( מּ,_מּ)",
  "గ .̫ గ",
  "(๑´ㅂ`๑)",
  "三( ᐛ )",
  "ଲ",
  "ଇ",
  "ଉ",
  "କ",
  "'◡'",
  "•́.•̀",
  "･ᴗ･",
  "ฅ'ω'ฅ♪",
  "нёιιö",
  "◍'ㅅ'◍",
  "´͈ ᵕ `͈"
]

window.onload = () => {
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
    let x = e.x
    let y = e.y
    let emj = __emoji[Math.floor(Math.random() * __emoji.length)]
    let c = color[Math.floor(Math.random() * color.length)]
    text.textContent = emj
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