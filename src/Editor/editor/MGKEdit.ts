/** @module editor/MGKEdit */

//#region Imports
import { Renderer } from "./../../Framework/components/types/renderer";
import { GameCore, OnDOMContentLoaded } from "./../../Framework/game/game-core";
import { MGKEditLogic } from "./../editor-logic/MGKEdit-Logic";
//#endregion

//#region MGKEdit Global Methods
/**
 * PreInit() occursS before component initialization but after component creation.
 * GameCore calls this. Make sure to assign it to this.preInitFunc.
 * 
 * @param {MGKEdit} game
 * @return {*}  {boolean}
 */
function PreInit(game: GameCore): boolean {
    try {
        // Pre-Initialization
        for (let s of game.createdComponents) {
            let success: any = JSON.parse(s);
            if (success.code === "exists" || success.code === "error") {
                console.error("GameCore: VInit() -> Failed to initialize [" + success.comName + "] component!");
                switch(success.comName) {
                    case "babylon-js": {
                        // Renderer not supported... games need graphics!!!
                        return false;
                        break;
                    }

                    default: {
                        // Component name does not match the created component
                        console.error("The component with the name [" + success.comName + "] did not initialize but is optional.");
                    }
                }

                // Assume if at this point the failed components were optional.
                return true;
            }

            if (success.code === "created") {
                // Configure the created components in their appropriate case "name": {}
                // This happens BEFORE the actual component is initialized with VInit().
                switch(success.comName) {
                    case "babylon-js": {
                        // Renderer
                        game.comMan.GetByName<Renderer>("babylon-js")!.Canvas = this._canvas;
                        game.comMan.GetByName<Renderer>("babylon-js")?.SetGameCore(this);
                        // Ready to turn the power on for rendering and updating game components!
                        // Crank the game with the initial update.
                        game.comMan.GetByName<Renderer>("babylon-js")?.StartRendering();
                        // This will update all components one time, but if the renderer for babylon-js is created in comMan then the game's VUpdate() will continuously call
                        // in the babylon runRenderLoop() function as well as all the other components. The renderer's runLoop member must be set to true in the game class with
                        // <DerivedClassNameFromThisBaseClass>.StartRendering();
                        break;
                    }

                    default: {
                        // Component name does not match the created component
                        console.error("The component with the name [" + success.comName + "] does not exist or does not match the name of the component created!");
                    }
                }
            }
        }

        return true;
    } catch (err) {
        console.error("GameCore: VInit() -> PreInit() -> ### ERROR:\n" + JSON.stringify(err, null, 2));
        return false;
    }
}
//#endregion

/**
 * Main game class. (Based on GameCore)
 *
 * @export
 * @class MGKEdit
 * @extends {GameCore}
 */
export class MGKEdit extends GameCore {
    /**
     * Creates an instance of MGKEdit.
     * @param {string} _canvasElement
     * @memberof MGKEdit
     */
    constructor(_canvasElement: string) {
        super(_canvasElement, __dirname + "/../components/", new MGKEditLogic());
    }

    //#region Control Method Overrides
    /**
     * Creates componenents, assigns the PreInit() function to GameCore's preInitFunc, and then calls the GameCore base class VInit().
     *
     * @return {*}  {boolean}
     * @memberof MGKEdit
     */
    public VInit(): boolean {
        if (this.reInit === true) {
            // Create componets here:
            if (this.createdComponents.length === 0) {
                this.createdComponents.push(this.comMan.Create("babylon-js", "renderer")); // This one needs to be last!
            }

            // Assign the pre init function so that GameCore can call it before calling comMan.Init();
            if (!this.preInitFunc) {
                this.preInitFunc = PreInit;
            }
        }

        return super.VInit();
    }

    /**
     * Right now just calls base class VUpdate() from GameCore.
     *
     * @memberof MGKEdit
     */
    public VUpdate(): void {
        super.VUpdate();
    }

    /**
     * Checks to see if exitting. If so, a confirmation prompt is displayed before terminating. If canceled, the dialog is removed.
     *
     * @memberof MGKEdit
     */
    public VShutdown(): void {
        if (this.exitting === true) {
            let uiStatic: HTMLElement | null = document.getElementById("mgk-ui-static");
            if (!document.getElementById("quitPrompt")) {
                uiStatic?.appendChild(this.QuitPrompt());
            }
        } else {
            if (document.getElementById("quitPrompt")) {
                document.getElementById("quitPrompt")?.remove();
            }
        }

        super.VShutdown();
    }
    //#endregion
}

//#region Game Engine Entry Point Call
OnDOMContentLoaded(function () {
    // Create the game using the 'renderCanvas'.
    let game: MGKEdit = new MGKEdit('render-canvas');

    GameCore.SetGameType<MGKEdit>(game);

    // Initialize the game and all of its components
    if (!game.VInit()) {
        let splashScreen: HTMLElement | null = document.getElementById("mgk-splash-screen");
        let uiStatic: HTMLElement | null = document.getElementById("mgk-ui-static");
        uiStatic?.removeChild(splashScreen!);
        
        uiStatic?.appendChild(game.Fatal(
            "Could not initialize editor!", 
            function (event: MouseEvent) {
                game.Quit();
            },
            1
        ));

        return;
    }
    
    setTimeout(() => {
        let splashScreen: HTMLElement | null = document.getElementById("mgk-splash-screen");
        let uiStatic: HTMLElement | null = document.getElementById("mgk-ui-static");
        uiStatic?.removeChild(splashScreen!);
    }, 2000);
});
//#endregion
