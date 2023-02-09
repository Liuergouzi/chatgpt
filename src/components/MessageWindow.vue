<template>
    <div class="RightCont">
        <!--消息接收-->
        <div :key="index" v-for="(item, index) in messageList_copy">
            <!--机器人-->
            <div class="customerServiceDiv" v-if="item.sendPeople == 'other'">
                <div class="answerHead">
                    <img src="../assets/images/service_head.png" />
                </div>
                <div v-if="item.sendType == 1" class="answers">
                    <img class="jiao" src="../assets/images/other_radio.jpg" />
                    <div v-html="item.message"></div>
                </div>
                <div v-else-if="item.sendType == 2" class="SendImage">
                    <img v-bind:src="item.message" />
                </div>
            </div>

            <!--自己-->
            <div class="myselfDiv" v-if="item.sendPeople == 'me'">
                <div v-if="item.sendType == 1" class="news">
                    <img class="jiao" src="../assets/images/radio.jpg" />
                    {{ item.message }}
                </div>
                <div v-else-if="item.sendType == 2" class="SendImage">
                    <img v-bind:src="item.message" />
                </div>
                <div class="nesHead">
                    <img src="../assets/images/visitor.png" />
                </div>
            </div>
            <div style="clear: both"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MessageWindow',
    props: {
        messageList: Object,
    },
    mounted() {
    },
    data() {
        return {
            messageList_copy: this.messageList,
        }
    },
    methods: {
    },
    watch: {
    }

}
</script>
<style scoped>
@import url("../assets/css/MessageWindow.css");
</style>