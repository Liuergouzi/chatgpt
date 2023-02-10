<template>

    <div class="Chat">
        <!--会话窗口-->
        <div class="customerChat">
            <div class="customerChatHead" :style="this.$store.state.bgColor">
                【轮子哥】chatGPT
                <div class="customerChatSpeed">调整打字速度<input v-model="speed" class="customerChatSpeedInput" /></div>
                <div class="customerChatSpeed" v-on:click="isShowLogWrite = !isShowLogWrite">日志</div>
            </div>

            <LogWrite v-show="isShowLogWrite" @isClose="isShowLogWrite = !isShowLogWrite"></LogWrite>

            <!--聊天内容-->
            <MessageWindow id="RightCont" :messageList="messageList" class="customerChatMessage">
            </MessageWindow>

            <!--聊天框底部-->
            <div class="customerChatFoot">
                <div v-show="!allowSession" class="notAllowSeesion"></div>
                <div class="customerChatTool">
                    <!--工具栏-->
                    <div class="customerChatToolList">
                        <ul>
                            <li v-on:click="EmoteShow = false" style="position: relative">
                                <img src="../assets/images/imageFile.png" />
                                <SendImage @sendMessage="sendMessage"></SendImage>
                            </li>
                        </ul>
                    </div>
                    <!--发送内容-->
                    <div style="height: calc(100% - 70px)">
                        <textarea v-model="sendData" class="customerChatText"
                            :placeholder="allowSession ? '道友，请传音' : footHit" v-on:keyup.enter="enterSend"></textarea>
                        <button class="customerChatButton" v-on:click="sendMessage(sendData, 1,'me')"
                            :style="this.$store.state.bgColor">
                            发送(s)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import MessageWindow from '@/components/MessageWindow.vue';
import SendImage from '@/components/SendImage.vue';
import LogWrite from '@/components/LogWrite.vue';
import axios from 'axios';

export default {
    components: {
        MessageWindow,
        SendImage,
        LogWrite
    },
    data() {
        return {
            messageList: [],
            allowSession: false,
            netCount: 0,
            footHit: '...请耐心等待,轮子哥正在为你火速加载中...',
            sendData: '',
            oldSendData: '',
            speed: 110,
            isShowLogWrite: false,
            loadLoop:function(){}
        }
    },
    mounted() {
        this.initialization();
    },
    methods: {
        initialization() {
            this.ajax('你好');
        },

        ajax(sendMessage) {
            let params = { max_tokens: 4048, model: "text-davinci-003", stream: true };
            params.prompt = sendMessage;
            this.typingGoBack();
            axios({
                method: 'post',
                url: 'https://api.openai.com/v1/completions',
                data: params
            }).then((response) => {
                this.messageList[this.messageList.length - 1].message = '';
                clearInterval(this.loadLoop);
                this.allowSession = true;
                this.netCount = 0;
                this.footHit = '...请耐心等待,轮子哥正在为你火速加载中...';
                this.oldSendData = '';

                //stream: true 开启控制流，进入循环打字，凸(艹皿艹 )，回复时间貌似没有变化，白改了
                let responseFinish;
                let responseByte;
                var index = 0;
                var textLoop = setInterval(() => {
                    //分割转json再提取数据，开启控制流后需要循环获取
                    responseByte = JSON.parse(response.data.slice(5, -1).split("data:")[index]).choices[0].text;
                    console.log(responseByte)
                    this.messageList[this.messageList.length - 1].message += responseByte;
                    //结束
                    responseFinish = JSON.parse(response.data.slice(5, -1).split("data:")[index]).choices[0].finish_reason;
                    if (responseFinish === "stop") {
                        clearInterval(textLoop);
                    }
                    index++;
                    if (index % 20 == 0) {
                        this.toBottom(128)
                    }
                }, 100);

                //stream: false 关闭控制流，
                // let text = response.data.choices[0].text.slice(0, 2)
                // if (response.data.choices[0].text.slice(0, 2) === `\n\n`) {
                //     console.log("是", response.data.choices[0].text.slice(0, 2))
                //     text = response.data.choices[0].text.slice(2, -1).replace(/\n\n/g, '<br>    ');
                // } else {
                //     console.log("否", response.data.choices[0].text.slice(0, 2))
                //     text = response.data.choices[0].text.replace(/\n\n/g, '<br>    ');
                // }
                // //打印
                // this.typing(text);

            }).catch(error => {
                clearInterval(this.loadLoop);
                this.$toast("请检查网络设置或耐心等待刷新，如果多次刷新依然无法连接成功请联系轮子哥");
                if (this.netCount <= 5) {
                    this.netCount = this.netCount + 1;
                    if (this.oldSendData != '') {
                        this.footHit = "——————网络异常，第" + this.netCount + "次重新发送——————";
                        this.ajax(this.oldSendData);
                    } else {
                        this.footHit = "——————网络连接异常，第" + this.netCount + "次尝试重新连接，请耐心等待——————";
                        this.initialization();
                    }
                } else {
                    this.$toast("网络异常，请刷新后重试！");
                    this.footHit = "网络异常，请刷新后重试！";
                }
                console.log(JSON.stringify(error))
            })
        },

        sendMessage(data, sendType, sendPeople) {
            //判断发送类型
            if (sendType === 1 && this.sendData.length <= 0) {
                this.$toast("道友这般寡言可着实令人难堪！");
                return;
            }
            let obj = {}
            obj.sendType = sendType;
            obj.sendPeople = sendPeople;
            obj.message = '';
            this.messageList.push(obj);
            if (sendType === 1) {
                this.typing(data);
            } else {
                obj.message = data;
                this.$toast("chatGPT当前暂时无法接收图片，请等待官网更新")
            }
            this.allowSession = false;
            this.oldSendData = this.sendData;
            this.sendData = '';
            this.ajax(data);
        },

        //文字打印
        typing(text) {
            var messageLength = this.messageList.length - 1;
            var contentArr = text.split("");
            var content = "";
            var index = 0;
            var ID = setInterval(() => {
                content += contentArr[index];
                this.messageList[messageLength].message = content + "_";
                index++;
                if (index === contentArr.length) {
                    console.log(this.messageList[messageLength].message)
                    this.messageList[messageLength].message = content;
                    clearInterval(ID);
                }
                if (index % 20 == 0) {
                    this.toBottom(128)
                }
            }, this.speed);
        },

        typingGoBack(){
            let obj = {}
            obj.sendType = 1;
            obj.sendPeople = 'other';
            obj.message = '';
            this.messageList.push(obj);
            var index = 0;
            this.loadLoop = setInterval(() => {
                switch (index % 4) {
                    case 1: this.messageList[this.messageList.length - 1].message = "☆"; break;
                    case 2: this.messageList[this.messageList.length - 1].message = "★"; break;
                    case 3: this.messageList[this.messageList.length - 1].message = "♡"; break;
                    case 4: this.messageList[this.messageList.length - 1].message = "♥"; break;
                }
                index++;
            }, 250);
        },

        //回到底部
        toBottom(time) {
            setTimeout(() => {
                let RightCont = document.getElementById("RightCont");
                if (RightCont != null) {
                    let scrollHeight2 = RightCont.scrollHeight;
                    RightCont.scrollTop = scrollHeight2;
                }
            }, time);
            clearTimeout();
        },

    }


}
</script>

<style scoped>
@import url("../assets/css/HomeView.css");
</style>