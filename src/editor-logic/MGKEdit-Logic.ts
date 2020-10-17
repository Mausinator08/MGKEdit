/** @module editor-logic */

//#region Imports
import { GameCore } from "./../../../MGKFrameworkJS/src/game/game-core";
import { HumanView } from "./../../../MGKFrameworkJS/src/game-views/types/human-view";
import { BaseGameLogic } from "./../../../MGKFrameworkJS/src/game-logic/base-game-logic";
import { Renderer } from "./../../../MGKFrameworkJS/src/components/types/renderer";
//#endregion

//#region MGKEditLogic Global Methods
function LogicPreInit(logic: MGKEditLogic): boolean {
    try {
        // Initialize non human views here:

        // No human views in servers.
        if (logic.isServerLogic === true) {
            return true;
        }

        // If we made it this far, it's not a server, and human views are welcome.
        if (logic.viewMan.GetArrayByType<HumanView>("human-view").length > 0) {
            logic.viewMan.GetArrayByType<HumanView>("human-view").forEach(hv => {
                hv.SetRendererName("babylon-js");
            });
        }

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
//#endregion

/**
 *
 *
 * @export
 * @class MGKEditLogic
 * @extends {BaseGameLogic}
 */
export class MGKEditLogic extends BaseGameLogic {
    /**
     * Creates an instance of MGKEditLogic.
     * @memberof MGKEditLogic
     */
    constructor() {
        super(__dirname + "/../editor-views/", __dirname + "/../editor-states/");
    }

    //#region Control Method Overrides
    /**
     *
     *
     * @return {*}  {boolean}
     * @memberof MGKEditLogic
     */
    public VInit(): boolean {
        // #####
        // ### Do NOT create ANY views right here just yet in case this is not a server, because even though human views need to be updated (rendered) last, it will be the first item created in array and found first!
        // #####
        if (this.reInit === true) {
            // Only create human views if this is not a server!
            if (this.isServerLogic === false) {
                this.createdViews.push(this.viewMan.Create("human-player-1", "human-view"));
            }

            // Create non human views here:


            this.preInitFunc = LogicPreInit;
        }

        return super.VInit();
    }

    /**
     *
     *
     * @return {*}  {void}
     * @memberof MGKEditLogic
     */
    public VUpdate(): void {
        // Do not continue any further if we are not initialized or the game logic is paused.
        if (this.paused === true || this.isInitialized === false) {
            // At least check the human view if this is not set on a server so that a working dialog can still appear and be used for exit prompts and warnings/errors.
            if (this.isServerLogic === true) {
                // TODO: Something needs to check for whetehr or not we are shutting down the server here:
                super.VUpdate();
                return;
            }

            // Render all humans!
            if (this.viewMan.GetArrayByType<HumanView>("HumanView").length > 0) {
                this.viewMan.GetArrayByType<HumanView>("HumanView").forEach(hv => {
                    hv.SetBackgroundColor(0.0, 0.0, 1.0, 1.0);
                });
            }

            super.VUpdate();
            return;
        }

        // Any non human views can be dealt with here (especially if autoUpdate is set to false):

        // If this is the game server, no further updates are needed. (No HumanViews on game server... DESTROY ALL HUMANS! "Um... Lambert? Am I being stealthy enough?" : "Keep it up Fisher, you're doing great!")
        if (this.isServerLogic === true) {
            super.VUpdate();
            return;
        }

        // Render all humans!
        if (this.viewMan.GetArrayByType<HumanView>("HumanView").length > 0) {
            this.viewMan.GetArrayByType<HumanView>("HumanView").forEach(hv => {
                hv.SetBackgroundColor(0.0, 0.0, 1.0, 1.0);
            });
        }

        super.VUpdate();
    }

    /**
     *
     *
     * @memberof MGKEditLogic
     */
    public VShutdown(): void {
        super.VShutdown();
    }
    //#endregion
}