<template>

    <div class="Chat">
        <!--会话窗口-->
        <div class="customerChat">
            <div class="customerChatHead" :style="this.$store.state.bgColor">
                【轮子哥】chatGPT
                <div class="customerChatCenterText">提问最大回复量：{{ maxTokens }}字符<br>语义联系最大量：{{ 4096-maxTokens }}字符</div>
                <div is-link @click="showPopup = !showPopup"><img src="../assets/images/setting.png"></div>
                <van-popup v-model:show="showPopup" position="right"
                    :style="{ width: '50%', height: '100%', padding: '10px', }">
                    <br>
                    <p>提问最大回复量（ai回复最大字数）：</p>
                    <van-slider v-model="maxTokens" :min="1000" :max="3500">
                        <template #button>
                            <div class="custom-button">{{ maxTokens }}</div>
                        </template>
                    </van-slider>
                    <br>
                    <p>语义联系最大量（决定最多关联多少上下文）：</p>
                    <van-slider v-model="maxTokens" :min="1000" :max="3500" disabled reverse>
                        <template #button>
                            <div class="custom-button">{{ 4096 - maxTokens }}</div>
                        </template>
                    </van-slider>
                    <br>
                    <p>打字速度（数值越高越慢）：</p>
                    <van-slider v-model="speed" :min="0" :max="3000">
                        <template #button>
                            <div class="custom-button">{{ speed }}</div>
                        </template>
                    </van-slider>
                    <br>
                    <p>控制流（ai回复速度有点差别）：</p>
                    <van-switch v-model="isStream" />
                    <br>
                    <div class="customerChatLogWrite" v-on:click="isShowLogWrite = !isShowLogWrite">日志</div>
                </van-popup>
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
            maxTokens: 2048,
            messageList: [],
            allowSession: false,
            showPopup: false,
            isStream: true,
            netCount: 0,
            footHit: '...请耐心等待,轮子哥正在为你火速加载中...',
            sendData: '',
            oldSendData: '',
            speed: 110,
            isShowLogWrite: false,
            loadLoop: function () { }
        }
    },
    mounted() {
        this.initialization();
    },
    methods: {
        initialization() {
            this.allowSession = true
            //    this.ajax('你好');
        },

        ajax(sendMessage) {
            let params = { max_tokens: this.maxTokens, model: "text-davinci-003", stream: this.isStream };
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

                if (this.isStream) {
                    //stream: true 开启控制流，进入循环打字，凸(艹皿艹 )，回复时间貌似没有变化，白改了
                    let responseFinish;
                    let responseByte;
                    var index = 0;
                    var textLoop = setInterval(() => {
                        //分割转json再提取数据，开启控制流后需要循环获取
                        responseByte = JSON.parse(response.data.slice(5).split("data:")[index]).choices[0].text;
                        this.messageList[this.messageList.length - 1].message += responseByte;
                        //结束
                        responseFinish = JSON.parse(response.data.slice(5).split("data:")[index]).choices[0].finish_reason;
                        if (responseFinish === "stop") {
                            this.messageList[this.messageList.length - 1].sendSize = this.getByteLength(this.messageList[this.messageList.length - 1].message)
                            clearInterval(textLoop);
                            this.toBottom(128);
                        }
                        index++;
                        if (index % 20 == 0) {
                            this.toBottom(128)
                        }
                    }, 100);
                } else {
                    //stream: false 关闭控制流，
                    let text = response.data.choices[0].text.slice(0, 2)
                    if (response.data.choices[0].text.slice(0, 2) === `\n\n`) {
                        console.log("是", response.data.choices[0].text.slice(0, 2))
                        text = response.data.choices[0].text.slice(2).replace(/\n\n/g, '<br>    ');
                    } else {
                        console.log("否", response.data.choices[0].text.slice(0, 2))
                        text = response.data.choices[0].text.replace(/\n\n/g, '<br>    ');
                    }
                    //打印
                    this.typing(text);
                }
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
            //判断空
            if (sendType === 1 && this.sendData.length <= 0) {
                this.$toast("道友这般寡言可着实令人难堪！");
                return;
            }

            var sendText = this.spliceText(data);
            //console.log("大小" + this.getByteLength(sendText + `(You:` + data + `\n)`))
            let obj = {}
            obj.sendType = sendType;
            obj.sendPeople = sendPeople;
            obj.sendSize = this.getByteLength(`(You:` + data + `\n)`) - 2;
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

            this.ajax(sendText);
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
                    this.messageList[messageLength].message = content;
                    clearInterval(ID);
                    this.toBottom(128)
                }
                if (index % 20 == 0) {
                    this.toBottom(128)
                }
            }, this.speed);
        },

        //计算总字符数，根据字符数范围内进行上下文字体拼接
        spliceText(data) {
            console.log(JSON.stringify(this.messageList))
            var messageLength = this.messageList.length - 1;
            var totalSize = this.getByteLength(`(You:` + data + `\n)`) - 2;
            var indexOf = -1;
            for (var i = messageLength; i >= 0; i--) {
                if (totalSize < 4096 - this.maxTokens) {
                    totalSize += this.messageList[i].sendSize;
                    indexOf++;
                }
            }
            var sendText = '';
            if (indexOf >= 0) {
                this.messageList.slice(messageLength - indexOf).forEach(element => {
                    if (element.sendPeople == 'me') {
                        sendText += `(You:${element.message}\n)`;
                    } else {
                        sendText += element.message;
                    }
                });
            }
            console.log(totalSize + "索引" + indexOf + "拼接字符" + sendText + `(You:` + data + `\n)`)
            return sendText + `(You:` + data + `\n)`;
        },

        //获取大小
        getByteLength(str) {
            let len = 0;
            for (let i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                    len += 2;
                } else {
                    len++;
                }
            }
            return len;
        },


        //闪烁
        typingGoBack() {
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
