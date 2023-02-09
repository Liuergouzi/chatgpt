<template>

    <div class="logBody" v-show="isShow">
        <div class="logText">
            <div class="logClose" v-on:click="close">x</div>
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
        close(){
            this.$emit('isClose',false)
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
    z-index: 999;
    width: 70%;
    height: 70%;
    left: 25%;
    top: 55px;
    box-shadow: 1px 1px 10px 10px #f8f3f3;
    border-radius: 10px;
}

.logText {
    padding: 10px;
    display: list-item;
}

.logClose {
    float: right;
}

.logTime {
    text-align: center
}
</style>
