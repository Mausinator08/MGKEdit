/** @module game-views/types/human-view */

//#region Imports
import { IGameView } from "../game-view-interface";
import { Renderer } from "../../components/types/renderer";
import { GameCore } from "../../game/game-core";
import { BaseGameLogic } from "../../game-logic/base-game-logic";
import * as BABYLON from "babylonjs";
//#endregion

/**
 * This is the base/default human-view. (Renders to screen, plays audio, accepts input... you know... stuff humans do to/get from machines.)
 *
 * @export
 * @class HumanView
 * @implements {IGameView}
 */
export class HumanView implements IGameView {
    //#region Fields
    /**
     * This is the name of the view instance.
     *
     * @type {string}
     * @memberof HumanView
     */
    public name: string = "HumanView";
    /**
     * This is the type of the view.
     *
     * @type {string}
     * @memberof HumanView
     */
    public type: string = "HumanView";
    /**
     * Whether game-view-manager automatically updates this instance.
     *
     * @type {boolean}
     * @memberof HumanView
     */
    public autoUpdate: boolean = false;
    /**
     * Whether this instance needs to have its VInit() method completed in game-view-manager.
     *
     * @type {boolean}
     * @memberof HumanView
     */
    public reInit: boolean = true;
    /**
     * Whether to call VShutdown() in game-view-manager and free resources for this view.
     *
     * @type {boolean}
     * @memberof HumanView
     */
    public requestShutdown: boolean = false;
    /**
     * The reference to the game's logic system.
     *
     * @type {BaseGameLogic}
     * @memberof HumanView
     */
    public gameLogic: BaseGameLogic;
    /**
     * The name of the renderer instance to use. (The renderer is a component.)
     *
     * @private
     * @type {string}
     * @memberof HumanView
     */
    private rendererName: string = "";
    /**
     * Indicates whether the view has been successfully initialized.
     *
     * @private
     * @type {boolean}
     * @memberof HumanView
     */
    private isInitialized: boolean = false;
    /**
     * The renderer's background color to clear the screen to.
     *
     * @private
     * @type {*}
     * @memberof HumanView
     */
    private clearColor: any = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };

    /**
     * The default scene loader. (Uses BABYLONJS by default.)
     * To get other rendering systems to work, a decoupled rendering interface needs to be created.
     * 
     * @private
     * @type {(BABYLON.Scene, HTMLCanvasElement) => BABYLON.Scene}
     * @memberof HumanView
     */
    private cbSceneLoader: (scene: BABYLON.Scene, canvas: HTMLCanvasElement) => BABYLON.Scene = function (scene: BABYLON.Scene, canvas: HTMLCanvasElement): BABYLON.Scene {
        let defaultCamera: BABYLON.FreeCamera = new BABYLON.FreeCamera("camera_default", new BABYLON.Vector3(-5, 10, -5), scene);

        defaultCamera.setTarget(BABYLON.Vector3.Zero());
        defaultCamera.attachControl(canvas, true);

        return scene;
    };
    //#endregion
    
    //#region Accessors
    /**
     * Indicates whether the view has been successfully initialized.
     *
     * @return {*}  {boolean}
     * @memberof HumanView
     */
    public VIsInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * Re-initializes the human view.
     *
     * @memberof HumanView
     */
    public VReInit(): void {
        this.reInit = true;
    }

    /**
     * Whether this instance needs to have its VInit() method completed in game-view-manager.
     *
     * @return {*}  {boolean}
     * @memberof HumanView
     */
    public VIsReInit(): boolean {
        return this.reInit;
    }

    /**
     * Whether we are to shutdown the human view.
     *
     * @return {*}  {boolean}
     * @memberof HumanView
     */
    public VShutdownRequested(): boolean {
        return this.requestShutdown;
    }

    /**
     * Marks the human view for shutdown.
     *
     * @memberof HumanView
     */
    public VRequestShutdown(): void {
        this.requestShutdown = true;
    }

    /**
     * Sets the clearColor to the color the renderer will clear to.
     *
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     * @memberof HumanView
     */
    public SetBackgroundColor(r: number, g: number, b: number, a: number): void {
        this.clearColor.r = r;
        this.clearColor.g = g;
        this.clearColor.b = b;
        this.clearColor.a = a;
    }

    /**
     * The component to use for rendering.
     *
     * @param {string} name
     * @memberof HumanView
     */
    public SetRendererName(name: string) {
        this.rendererName = name;
    }

    /**
     * Overrides the scene loader. (Can be BABYLONJS renderer compatible or other rendering system as long as the component is loaded. Right now only BABYLONJS works.)
     * To get other rendering systems to work, a decoupled rendering interface needs to be created.
     *
     * @param {(BABYLON.Scene, HTMLCanvasElement) => BABYLON.Scene} cbSceneFunc
     * @memberof HumanView
     */
    public SetSceneLoader(cbSceneFunc: (scene: BABYLON.Scene, canvas: HTMLCanvasElement) => BABYLON.Scene): void {
        this.cbSceneLoader = cbSceneFunc;
    }
    //#endregion
    
    /**
     * Creates an instance of HumanView.
     * @param {string} name
     * @param {BaseGameLogic} gameLogic
     * @memberof HumanView
     */
    constructor(name: string, gameLogic: BaseGameLogic) {
        this.name = name;
        this.gameLogic = gameLogic;
    }

    //#region Control Method Overrides
    /**
     * Sets up the renderer, and other human capable inputs/outputs.
     *
     * @return {*}  {boolean}
     * @memberof HumanView
     */
    public VInit(): boolean {
        let renderer = GameCore.game.comMan.GetByName<Renderer>(this.rendererName);

        renderer?.CreateScene(this.cbSceneLoader);

        this.isInitialized = true;
        this.reInit = false;
        return true;
    }

    /**
     * Updates the human view renderer and other inputs/outputs.
     *
     * @return {*}  {void}
     * @memberof HumanView
     */
    public VUpdate(): void {
        if (GameCore.game.Quitting() === true) {
            this.requestShutdown = true;
        }

        if (this.isInitialized === false) {
            console.warn("HumanView: VUpdate() -> The human view [" + this.name + "] called update without being initialized!\n" +
            "Call the VInit() function and ensure it returns true before calling VUpdate().");
            return;
        }

        let renderer = GameCore.game.comMan.GetByName<Renderer>(this.rendererName);

        if (renderer?.IsInitialized === false) {
            console.warn("HumanView: VUpdate() -> The human view has detected that the renderer is not initialized!");
            return;
        }

        // Grab and clear the background color to start the scene rendering.
        let cc = this.clearColor;
        renderer?.BeginScene(cc.r, cc.g, cc.b, cc.a);
        // Call this to end the rendering scene and present it to the screen.
        renderer?.EndScene();
    }

    /**
     * If time to shutdown, frees resources and sets to uninitialized.
     *
     * @memberof HumanView
     */
    public VShutdown(): void {
        if (this.requestShutdown === true) {
            this.isInitialized = false;
            this.requestShutdown = false;
        }
    }
    //#endregion
}

// Renderer component creator
/**
 * A method to create the human view in game-view-manager.Create(...).
 *
 * @export
 * @param {string} name
 * @param {BaseGameLogic} gameLogic
 * @return {*}  {HumanView}
 */
export function Create(name: string, gameLogic: BaseGameLogic): HumanView {
    return new HumanView(name, gameLogic);
}
