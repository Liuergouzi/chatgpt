<template>

    <div class="logBody">

        <div class="logClose" v-on:click="close">x</div>
      
        <div class="logText">
            <br>
            <div>
                <div class="logTime">2023/2/11 17:12</div>
                <hr />
                1、修复小bug<br />
                2、修复不能上下文联系<br />
            </div>

            <br />
            <div>
                <div class="logTime">2023/2/11 2:27</div>
                <hr />
                1、修改图片显示，chatGPT大多回复的图片是无法访问的，因此仅处理了自己发送的图片进行显示，功能预留等待官网更新<br />
                2、修改了控制流<br />
                3、增加等待闪烁<br />
                4、修复回滚到页面底部的小bug<br />
            </div>

            <br />
            <div>
                <div class="logTime">2023/2/8 20:12</div>
                <hr />
                1、新增了打字播放速度的手动调整<br />
                2、解决了chatgpt回复时携带的'\n\n'不能正确显示排版的问题<br />
                3、解决了网络异常、请求失败时相应提示不匹配的bug<br />
                4、解决了断线重连与第一次加载会发生交错的bug<br />
            </div>

            <br />
            <div>
                <div class="logTime">2023/2/8 7:56</div>
                <hr />
                基本完成了主要功能内容
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'LogWrite',
    props: {

    },
    mounted() {
    },
    data() {
        return {
        }
    },
    methods: {
        close() {
            this.$emit('isClose', false)
        }
    },
    watch: {
    }

}
</script>

<style scoped>
.logBody {
    position: absolute;
    background-color: #c9f6ea;
    z-index: 99999;
    width: 70%;
    height: 70%;
    left: 25%;
    top: 55px;
    box-shadow: 1px 1px 10px 2px #f8f3f3;
    border-radius: 10px;
    overflow-y: hidden;
}

.logText {
    height: 100%;
    display: list-item;
    overflow-y: scroll;
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 10px;
}

.logClose {
    float: right;
    margin: 10px;
}

.logTime {
    text-align: center
}
</style>
