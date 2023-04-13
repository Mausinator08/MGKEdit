/** @module actors/actor-factory */

//#region Imports
import { Component } from "../components/component";
//#endregion

/**
 * Creates actors based on the type of actor passed and it's components
 *
 * @export
 * @class ActorFactory
 * @extends {Component}
 */
export class ActorFactory extends Component {
    /**
     * Creates an instance of ActorFactory.
     * @memberof ActorFactory
     */
    constructor() {
        super("ActorFactory", "ActorFactory");
    }
}