<template>

    <div class="Chat">
        <!--会话窗口-->
        <div class="customerChat">
            <div class="customerChatHead" :style="this.$store.state.bgColor">
                【轮子哥】chatGPT
                <div class="customerChatSpeed">调整打字速度<input v-model="speed" class="customerChatSpeedInput" /></div>
                <div class="customerChatSpeed" v-on:click="isShowLogWrite =! isShowLogWrite">日志</div>
            </div>

            <LogWrite v-show="isShowLogWrite" @isClose="isShowLogWrite =! isShowLogWrite"></LogWrite>

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
            oldSendData:'',
            speed: 250,
            isShowLogWrite:false
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
            let params = { max_tokens: 4048, model: "text-davinci-003" , stream:true };
            params.prompt = sendMessage;
            axios({
                method: 'post',
                url: 'https://api.openai.com/v1/completions',
                data: params
            }).then((response) => {
                this.allowSession = true;
                let text;
                if(response.data.choices[0].text.slice(0,2)===`\n\n`){
                    // console.log("是") 
                    text = response.data.choices[0].text.slice(3,-1).replace(/\n\n/g,'<br>    ');
                }else{
                    // console.log("否",response.data.choices[0].text.slice(0,2))
                    text = response.data.choices[0].text.replace(/\n\n/g,'<br>    ');
                }
                let obj = {}
                obj.sendType = 1;
                obj.sendPeople = 'other';
                obj.message = '';
                this.messageList.push(obj);

                this.footHit= '...请耐心等待,轮子哥正在为你火速加载中...',
                this.oldSendData='';

                this.typing(text);

                this.toBottom(128)
                console.log(JSON.stringify(response))
            }).catch(error => {
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
            this.typing(data);
            this.allowSession = false;
            this.oldSendData=this.sendData;
            this.sendData = '';
            this.ajax(data);
            //让聊天窗口回到底部
            this.toBottom(128)
        },

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
            }, this.speed);
        },

        typingGoBack(isGoBack) {
            var messageLength = this.messageList.length - 1;
            let obj = {}
            obj.sendType = 1;
            obj.sendPeople = 'other';
            obj.message = '';
            this.messageList.push(obj);
            var index = 0;
            var ID = setInterval(() => {
                if (index % 2 == 0) {
                    this.messageList[messageLength].message = "|";
                } else {
                    this.messageList[messageLength].message = "~";
                }
                if (isGoBack) {
                    if (messageLength != this.messageList.length) {
                        this.messageList.splice(messageLength, 1)
                    }
                    clearInterval(ID);
                }
                index++;
            }, this.speed);

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