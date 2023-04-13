/** @module editor/MGKEdit */

//#region Imports
import { Renderer } from "./../../../MGKFrameworkJS/src/components/types/renderer";
import { GameCore } from "./../../../MGKFrameworkJS/src/game/game-core";
//#endregion

export class BabylonJSRenderer extends Renderer {
    //#region Fields
    //#endregion

    //#region Accessors
    //#endregion

    // Constructor
    constructor(name: string, args: Map<string, string>) {
        super(name, args);
    }

    //#region Control Method Overrides
    /**
     * Initializes the BabylonJS engine with the current rendering html canvas.
     *
     * @return {*}  {boolean}
     * @memberof Renderer
     */
    public VInit(): boolean {
        return super.VInit();
    }

    /**
     * Controls when to run the rendering loop for the game logic and views.
     *
     * @memberof Renderer
     */
    public VUpdate(): void {
        super.VUpdate();
    }

    /**
     * Will release the BabylonJS rendering items and shutdown.
     *
     * @memberof Renderer
     */
    public VShutdown(): void {
        super.VShutdown();
    }
    //#endregion
};

export function Create(name: string, args: Map<string, string> = new Map<string, string>()): BabylonJSRenderer {
    return new BabylonJSRenderer(name, args);
}
