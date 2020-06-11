import { Renderer } from "./../../../MGKFrameworkJS/src/components/renderer.js";
import { GameCore, OnDOMContentLoaded } from "./../../../MGKFrameworkJS/src/game/game-core.js";
import { MGKEditLogic } from "./../editor-logic/MGKEdit-Logic.js";
import { BrowserWindow, remote } from "electron";

// GameCore calls this. Make sure to assign it to this.preInitFunc.
function PreInit(game: MGKEdit): boolean {
    try {
        // Pre-Initialization
        game.createdComponents.forEach(s => {
            let success: any = JSON.parse(s);
            if (success.code === "exists" || success.code === "error") {
                console.error("GameCore: VInit() -> Failed to initialize [" + success.comName + "] component!");
                return;
            }

            if (success.code === "created") {
                // Configure the created components in their appropriate case "name": {}
                // This happens BEFORE the actual component is initialized with VInit().
                switch(success.comName) {
                    case "babylon-js": {
                        // Renderer
                        game.comMan.GetByName<Renderer>("babylon-js").SetCanvas(this._canvas);
                        game.comMan.GetByName<Renderer>("babylon-js").SetGameCore(this);
                        // Ready to turn the power on for rendering and updating game components!
                        // Crank the game with the initial update.
                        game.comMan.GetByName<Renderer>("babylon-js").StartRendering();
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
        });

        return true;
    } catch (err) {
        console.error("GameCore: VInit() -> PreInit() -> ### ERROR:\n" + JSON.stringify(err, null, 2));
        return false;
    }
}

// Main game class
export class MGKEdit extends GameCore {
    constructor(_canvasElement: string) {
        super(_canvasElement, __dirname + "/../components", new MGKEditLogic());
    }

    public VInit(): boolean {
        if (this.reInit === true) {
            // Create componets here:
            if (this.createdComponents.length === 0) {
                this.createdComponents.push(this.comMan.Create("babylon-js", "renderer")); // This one needs to be last!
            }

            // Assign the pre init function so that GameCore can call it before calling comMan.Init();
            if (this.preInitFunc === null) {
                this.preInitFunc = PreInit;
            }
        }

        return super.VInit();
    }

    public VUpdate(): void {
        super.VUpdate();
    }

    public VShutdown(): void {
        super.VShutdown();
    }
}

OnDOMContentLoaded(function () {
    // Create the game using the 'renderCanvas'.
    let game: MGKEdit = new MGKEdit('render-canvas');

    GameCore.SetGameType<MGKEdit>(game);

    // Initialize the game and all of its components
    if (!game.VInit()) {
        let _window: BrowserWindow = remote.getCurrentWindow();
        _window.close();
        game.Quit();
    }
});
