const fs = require('fs')
const path = require('path')

const notMined = ['.DS_Store', '.vscode', '.idea']
const sysFolderFilter = file => !notMined.includes(file) //过滤器,过滤掉系统文件

//文章路径
let article = path.resolve('docs/article')
//文章们
let articles = fs.readdirSync(article).filter(sysFolderFilter).map((p, i) => {
  let art = path.relative(path.resolve('.'), p)
  return `${i + 1}、[${art}](${path.join('article', art)})`
}).join('\n\n')

//目录模板
let template = path.resolve(__dirname, 'template.md')
let content = fs.readFileSync(template, 'utf8')
//处理结果
let resContent = content.replace('{{article}}', articles)
//写入Readme
let readme = path.resolve('docs/index.md')
fs.writeFileSync(readme, resContent, 'utf8')

console.log('目录生成成功~')