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

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var sky: egret.Bitmap = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        //计算距离以确保移动速度相同
        var calDistance: Function = function (beginx: number, beginy: number, endx: number, endy: number) {
            var vdis = Math.abs(beginx - endx);
            var hdis = Math.abs(beginy - endy);
            return Math.sqrt(vdis * vdis + hdis * hdis);
        }

        //创建角色
        var chara: Character = new Character(this);
        var distance: number = 0;
        chara.idle();

        //添加点击监听
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e: egret.TouchEvent): void {
            if (e.localY > this.stage.stageHeight * 0.6) {
                distance = calDistance(chara.x, chara.y, e.localX, e.localY);
                chara.move(e.localX, e.localY, this.distance);
            }
        }, this);

    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

}

//状态机
class StateMachine {
    currentState: state;

    //设置状态
    setState(e: state) {
        if (this.currentState != null) {
            this.currentState.onExit();
        }
        this.currentState = e;
        e.onEnter();
    }
}

interface state {
    onEnter(): void;
    onExit(): void;
}

class CharacterState extends StateMachine {

    //为了下面设置Character类的变量
    _character: Character;

    constructor(character: Character) {
        super();
        this._character = character;
    }

    onEnter() { }
    onExit() { }

}

class CharacterIdleState extends CharacterState {

    //进入时设置Character类的变量
    onEnter() {
        this._character._ifidle = true;
    }

    //离开时同理
    onExit() {
        this._character._ifidle = false;
    }

}

class CharacterMoveState extends CharacterState {

    onEnter() {
        this._character._ifmove = true;
    }

    onExit() {
        this._character._ifmove = false;
    }

}


class Character extends egret.DisplayObjectContainer {

    _main: Main;
    _stateMachine: StateMachine;
    _body: egret.Bitmap;
    _ifidle: boolean;
    _ifmove: boolean;
    _idleState: CharacterIdleState = new CharacterIdleState(this);
    _moveState: CharacterMoveState = new CharacterMoveState(this);


    constructor(main: Main) {
        super();
        this._main = main;
        this._body = new egret.Bitmap;
        this._body.texture = RES.getRes("1_png");
        this._main.addChild(this._body);
        this._body.anchorOffsetX = this._body.width / 3.5;
        this._body.anchorOffsetY = this._body.width * 0.95;
        this._stateMachine = new StateMachine();
        this._body.x = this._main.stage.stageWidth * 0.15;
        this._body.y = this._main.stage.stageHeight * 0.85;
        this._ifidle = true;
        this._ifmove = false;
    }

    public move(targetX: number, targetY: number, distance: number) {

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
            egret.Tween.get(this._body).to({ x: targetX, y: targetY }, 2000, egret.Ease.sineInOut).call(function () { this.idle() }, this);

        }
    }

    public idle() {

        this._stateMachine.setState(this._idleState);

        //如果状态机将_ifidle变量调整为true,则进入停止状态
        if (this._ifidle) {
            console.log("idle");
            this.startidle();
        }
    }

    //播放运动动画
    public startMove() {
        var list = ["1_png", "2_png", "3_png", "4_png", "5_png", "6_png", "7_png", "8_png", "9_png", "10_png", "11_png", "12_png", "13_png", "14_png", "15_png", "16_png", "17_png", "18_png", "19_png", "20_png", "21_png", "22_png", "23_png", "24_png", "25_png", "26_png"];
        var count = -1;

        //循环执行
        egret.Ticker.getInstance().register(() => {

            if (this._ifmove) {
                count = count + 0.5;
                if (count >= list.length) {
                    count = 0;
                }

                this._body.texture = RES.getRes(list[Math.floor(count)]);
            }

        }, this);

    }

    public startidle() {

        this._body.texture = RES.getRes("1_png");

    }

}


