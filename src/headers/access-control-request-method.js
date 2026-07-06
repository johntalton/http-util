import { EMPTY } from "../defs.js"
import { Assert } from "./util/assert.js"

export class AccessControlRequestMethod {
  /**
   * @param {string|undefined} header
   * @returns {string|undefined}
   */
  static parse(header) {
    if(header === undefined) { return undefined }
    Assert.isString(header)

    if(header === EMPTY) { return undefined }

    // options
    // get head
    // put post patch
    // delete
    // trace query
    //
    // todo check if valid verb/method

    return header.toUpperCase()

  }
}