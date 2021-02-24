# VueCLI3.x中接入Lottie动画

使用[lottie-web](https://www.npmjs.com/package/lottie-web)插件

如果接svg作为资源的lottie json就没什么好说的,参考官方文档:

```js
lottie.loadAnimation({
  container: element, // the dom element that will contain the animation
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'data.json' // the path to the animation json
});
```

如果静态资源是png图片,UI没办法把png转为svg的情况下,该怎么处理?

## 主要思路

1、排除url-loader对lottie需要引入资源的处理(需要判定特殊资源路径)

2、使用file-loader对lottie资源做原始引入处理(需要判定特殊资源路径)

3、编写组件,引入资源时将UI导出的data.json做二次处理,将资源本地路径变为线上路径,需要打印下lottie实例化出来的对象做分析

4、使用requireContext对图片做批量引入处理,不这样的化需要每张图片单独引入,太麻烦

5、实例化lottie,后面就是对lottie动画实例的各种操作了

## vue.config.js中的配置

```js
//规定了lottie的资源文件必须存放在名为'lottie'的子目录下
module.exports = {
  // other options ...
  chainWebpack: config => {
    //lottie图片路径配置,忽略url-loader对lottie文件夹下图片的处理
    config.module.rule('images')
      .exclude
      .add(/lottie\/.*?\.png$/)
    //添加对lottie文件夹下图片的处理,支持png图片,若有其他可在此正则中补充
    config.module
      .rule('lottie')
      .test(/lottie\/.*?\.png$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'lottie/[name]_[hash:8].[ext]' //输出文件名,带路径
      })
      .end()
  }
}
```

## Lottie组件

```html
<template>
  <div class="lottieContainer">
    <div class="lottie" ref="lottie"></div>
  </div>
</template>

<script>
/**
 * lottie-web文档地址 https://www.npmjs.com/package/lottie-web
 * 使用方法:
 * template: <Lottie :json="require('../assets/lottie/finger.json')" @init="lottieInit"></Lottie>
 * 注意事项:
 *   宽高最好自己写class定义动画宽高,lottie动画会自动满铺容器
 *   动画的设计稿宽度为750,使用iPhone6,7,8调试时页面元素宽高即为动画真实宽高
 *   可以直接使用这个宽高去定义容器宽高,会达到一个较好的适配
 * 参数说明:
 * @param {Object} json 必填,UI提供的json文件
 * @param {Function} init 必填,初始化lottie的方法,接受一个回调函数作为参数,说明如下:
 * scripts:
 * @param {Function} init 回调函数,执行该方法以初始化lottie
 * lottieInit(init) {
 * //这里使用了require.context语法将图片批量引入
      let lottieImagesRequire = require.context(
        "../assets/lottie/images/", //一般不同的动画文件只需更改此处的图片路径
        false,
        /\w+\.png$/
      );
      let images = [];
      lottieImagesRequire.keys().forEach(e => {
        images.push(lottieImagesRequire(e));
      });
      console.log(images);
      init(images,{});
    }
 */
//lottie
import lottie from 'lottie-web';
export default {
  props: ['json'],
  data() {
    return {
      instance: null
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    //实例销毁时清除动画
    this.instance.destroy();
    console.log('lottie destroied');
  },
  methods: {
    pathAnalyser(json) {
      /**
       * 传递给父级的init方法
       * @param {Array} images init方法接受的两个参数之一,当UI提供的json动画需要图片时使用该参数将图片引入,无图片可以传递空数组
       * @param {Object} options lottie动画的相关配置
       * @returns {AnimationItem}
       */
      return (images = [], options = {}) => {
        images.forEach(lottieImg => {
          let name = lottieImg.match(/[^/]+\.png$/g)[0];
          let path = lottieImg.replace(/[^/]+$/, '');
          json.assets.forEach(obj => {
            if (obj.layers) {
              //为组合图层时跳出,不做处理
              return;
            }
            if (name.includes(obj.p.replace('.png', ''))) {
              //配合webpack进行处理,更改json中的静态资源路径
              obj.u = path.includes('/lottie/') ? path : path + 'lottie/'; //主要为了区分开发和生产环境
              obj.p = name;
            }
          });
        });
        let animateOption = {
          container: this.$refs.lottie, // the dom element that will contain the animation
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: json // the path to the animation json
        };
        //挂载到内部实例上
        this.instance = lottie.loadAnimation(
          Object.assign(animateOption, options)
        );
        return this.instance;
      };
    },
    init() {
      let json = this.json;
      this.$emit('init', this.pathAnalyser(json)); //将动画实例抛出
    }
  }
};
</script>
```
