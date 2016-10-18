//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        //计算距离以确保移动速度相同
        var calDistance = function (beginx, beginy, endx, endy) {
            var vdis = Math.abs(beginx - endx);
            var hdis = Math.abs(beginy - endy);
            return Math.sqrt(vdis * vdis + hdis * hdis);
        };
        //创建角色
        var chara = new Character(this);
        var distance = 0;
        chara.idle();
        //添加点击监听
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            if (e.localY > this.stage.stageHeight * 0.6) {
                distance = calDistance(chara.x, chara.y, e.localX, e.localY);
                chara.move(e.localX, e.localY, this.distance);
            }
        }, this);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//状态机
var StateMachine = (function () {
    function StateMachine() {
    }
    var d = __define,c=StateMachine,p=c.prototype;
    //设置状态
    p.setState = function (e) {
        if (this.currentState != null) {
            this.currentState.onExit();
        }
        this.currentState = e;
        e.onEnter();
    };
    return StateMachine;
}());
egret.registerClass(StateMachine,'StateMachine');
var CharacterState = (function (_super) {
    __extends(CharacterState, _super);
    function CharacterState(character) {
        _super.call(this);
        this._character = character;
    }
    var d = __define,c=CharacterState,p=c.prototype;
    p.onEnter = function () { };
    p.onExit = function () { };
    return CharacterState;
}(StateMachine));
egret.registerClass(CharacterState,'CharacterState');
var CharacterIdleState = (function (_super) {
    __extends(CharacterIdleState, _super);
    function CharacterIdleState() {
        _super.apply(this, arguments);
    }
    var d = __define,c=CharacterIdleState,p=c.prototype;
    //进入时设置Character类的变量
    p.onEnter = function () {
        this._character._ifidle = true;
    };
    //离开时同理
    p.onExit = function () {
        this._character._ifidle = false;
    };
    return CharacterIdleState;
}(CharacterState));
egret.registerClass(CharacterIdleState,'CharacterIdleState');
var CharacterMoveState = (function (_super) {
    __extends(CharacterMoveState, _super);
    function CharacterMoveState() {
        _super.apply(this, arguments);
    }
    var d = __define,c=CharacterMoveState,p=c.prototype;
    p.onEnter = function () {
        this._character._ifmove = true;
    };
    p.onExit = function () {
        this._character._ifmove = false;
    };
    return CharacterMoveState;
}(CharacterState));
egret.registerClass(CharacterMoveState,'CharacterMoveState');
var Character = (function (_super) {
    __extends(Character, _super);
    function Character(main) {
        _super.call(this);
        this._idleState = new CharacterIdleState(this);
        this._moveState = new CharacterMoveState(this);
        this._main = main;
        this._body = new egret.Bitmap;
        this._body.texture = RES.getRes("1_png");
        this._main.addChild(this._body);
        this._body.anchorOffsetX = this._body.width / 3.5;
        this._body.anchorOffsetY = this._body.width * 0.95;
        this._stateMachine = new StateMachine();
        this._body.x = this._main.stage.stageWidth * 0.15;
        this._body.y = this._main.stage.stageHeight * 0.9;
        this._ifidle = true;
        this._ifmove = false;
    }
    var d = __define,c=Character,p=c.prototype;
    p.move = function (targetX, targetY, distance) {
        //中止缓动动画，达到实现运动中更换目标点的目的
        egret.Tween.removeTweens(this._body);
        //触发状态机
        this._stateMachine.setState(this._moveState);
        //如果状态机将_ifwalk变量调整为true,则进入运动状态
        if (this._ifmove) {
            console.log("move");
            if (targetX > this._body.x) {
                this._body.skewY = 0;
            }
            else {
                this._body.skewY = 180;
            }
            this.startMove();
            egret.Tween.get(this._body).to({ x: targetX, y: targetY }, 2000, egret.Ease.sineInOut).call(function () { this.idle(); }, this);
        }
    };
    p.idle = function () {
        this._stateMachine.setState(this._idleState);
        //如果状态机将_ifidle变量调整为true,则进入停止状态
        if (this._ifidle) {
            console.log("idle");
            this.startidle();
        }
    };
    //播放运动动画
    p.startMove = function () {
        var _this = this;
        var list = ["1_png", "2_png", "3_png", "4_png", "5_png", "6_png", "7_png", "8_png", "9_png", "10_png", "11_png", "12_png", "13_png", "14_png", "15_png", "16_png", "17_png", "18_png", "19_png", "20_png", "21_png", "22_png", "23_png", "24_png", "25_png", "26_png"];
        var count = -1;
        //循环执行
        egret.Ticker.getInstance().register(function () {
            if (_this._ifmove) {
                count = count + 0.5;
                if (count >= list.length) {
                    count = 0;
                }
                _this._body.texture = RES.getRes(list[Math.floor(count)]);
            }
        }, this);
    };
    p.startidle = function () {
        this._body.texture = RES.getRes("1_png");
    };
    return Character;
}(egret.DisplayObjectContainer));
egret.registerClass(Character,'Character');
//# sourceMappingURL=Main.js.map