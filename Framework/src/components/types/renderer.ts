/** @module components/types/renderer */

//#region Imports
import * as BABYLON from 'babylonjs';
import { Component } from './../component';
import { Color4 } from 'babylonjs';
import { GameCore } from './../../game/game-core';
//#endregion

/**
 * BabylonJS renderer - this needs to be created and initialized after all other dependent components.
 *
 * @export
 * @class Renderer
 * @extends {Component}
 */
export class Renderer extends Component {
    //#region Fields
    /**
     * This is the main rendering canvas in index.html.
     *
     * @private
     * @type {HTMLCanvasElement}
     * @memberof Renderer
     */
    private _canvas: HTMLCanvasElement;
    /**
     * The BabylonJS Graphics/Physics Engine.
     *
     * @private
     * @type {BABYLON.Engine}
     * @memberof Renderer
     */
    private _engine: BABYLON.Engine;
    /**
     * BabylonJS Scene Nodes
     *
     * @private
     * @type {BABYLON.Scene}
     * @memberof Renderer
     */
    private _scene: BABYLON.Scene;
    /**
     * A reference to the GameCore class.
     *
     * @private
     * @type {GameCore}
     * @memberof Renderer
     */
    private gameCore: GameCore;
    /**
     * Determines if the game logic and views are running through the BabylonJS Loop or paused.
     *
     * @private
     * @type {boolean}
     * @memberof Renderer
     */
    private runLoop: boolean = false;
    /**
     * Arguments passed from exported Create() function.
     *
     * @type {Map<string, string>}
     * @memberof Renderer
     */
    public args: Map<string, string> = null;
    //#endregion

    /**
     * Creates an instance of Renderer.
     * @param {string} name
     * @memberof Renderer
     */
    constructor(name: string, args: Map<string, string>) {
        super(name, "renderer");
        this.args = args;
    }

    //#region Properties
    /**
     * Get the main rendering canvas from index.html.
     *
     * @type {HTMLCanvasElement}
     * @memberof Renderer
     */
    public get Canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    /**
     * This sets the html rendering canvas.
     *
     * @memberof Renderer
     */
    public set Canvas(value: HTMLCanvasElement) {
        this._canvas = value;
    }

    /**
     * Get the BabylonJS Engine.
     *
     * @type {BABYLON.Engine}
     * @memberof Renderer
     */
    public get Engine(): BABYLON.Engine {
        return this._engine;
    }

    /**
     * Set the BabylonJS Engine instance.
     *
     * @memberof Renderer
     */
    public set Engine(value: BABYLON.Engine) {
        this._engine = value;
    }

    /**
     * Get the currently rendered scene.
     *
     * @type {BABYLON.Scene}
     * @memberof Renderer
     */
    public get Scene(): BABYLON.Scene {
        return this._scene;
    }

    /**
     * Set the currently rendered scene.
     *
     * @memberof Renderer
     */
    public set Scene(value: BABYLON.Scene) {
        this._scene = value;
    }
    //#endregion

    //#region Accessors
    /**
     * Allows setting the referenced game.
     *
     * @param {GameCore} game
     * @memberof Renderer
     */
    public SetGameCore(game: GameCore): void {
        this.gameCore = game;
    }

    /**
     * Modify what is in the scene by passing a callback function to cbModifyScene.
     *
     * @param {(scene: BABYLON.Scene, canvas: HTMLCanvasElement) => BABYLON.Scene} cbModifyScene
     * @memberof Renderer
     */
    public ModifyScene(cbModifyScene: (scene: BABYLON.Scene, canvas: HTMLCanvasElement) => BABYLON.Scene): void {
        this._scene = cbModifyScene(this._scene, this._canvas);
    }
    //#endregion

    //#region CRUD Ops
    /**
     * Creates a new scene and returns it based on the passed callback function cbLoadScene.
     *
     * @param {(scene: BABYLON.Scene, canvas: HTMLCanvasElement) => BABYLON.Scene} cbLoadScene
     * @memberof Renderer
     */
    public CreateScene(cbLoadScene: (scene: BABYLON.Scene, canvas: HTMLCanvasElement) => BABYLON.Scene): void {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(this._engine);
        this._scene = scene;

        this._scene = cbLoadScene(scene, this._canvas);
    }
    //#endregion
    
    //#region Scene Rendering
    /**
     * Clears the screen to the specified color.
     *
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     * @memberof Renderer
     */
    public BeginScene(r: number, g: number, b: number, a: number): void {
        this._scene.clearColor = new Color4(r, g, b, a);
    }

    /**
     * Renders the scene.
     *
     * @memberof Renderer
     */
    public EndScene(): void {
        this._scene.render(false);
    }

    /**
     * Starts the game logic and views.
     *
     * @memberof Renderer
     */
    public StartRendering(): void {
        this.runLoop = true;
    }

    /**
     * Stops the game logic and views.
     *
     * @memberof Renderer
     */
    public StopRendering(): void {
        this._engine.stopRenderLoop();
    }
    //#endregion

    //#region Control Method Overrides
    /**
     * Initializes the BabylonJS engine with the current rendering html canvas.
     *
     * @return {*}  {boolean}
     * @memberof Renderer
     */
    public VInit(): boolean {
        if (BABYLON.Engine.isSupported()) {
            const engine = new BABYLON.Engine(this._canvas, true);
            this._engine = engine;

            window.addEventListener('resize', function () {
                engine.resize();
            });

            this.isInitialized = true;
            return super.VInit();
        } else {
            return false;
        }
    }

    /**
     * Controls when to run the rendering loop for the game logic and views.
     *
     * @memberof Renderer
     */
    public VUpdate(): void {
        if (GameCore.game.Quitting() === true) {
            this.requestShutdown = true;
        }

        if (this.isInitialized) {
            if (this.runLoop) {
                this._engine.runRenderLoop(() => {
                    if (this.gameCore.VInit() === true) {
                        this.gameCore.VUpdate();
                    }

                    this.gameCore.VShutdown();
                });
                this.runLoop = false;
            }
        }
        super.VUpdate();
    }

    /**
     * Will release the BabylonJS rendering items and shutdown.
     *
     * @memberof Renderer
     */
    public VShutdown(): void {
        super.VShutdown();
        this.runLoop = false;
    }
    //#endregion
};

/**
 * Renderer component creator
 *
 * @export
 * @param {string} name
 * @return {*}  {Renderer}
 */
export function Create(name: string, args: Map<string, string> = new Map<string, string>()): Renderer {
    return new Renderer(name, args);
}
