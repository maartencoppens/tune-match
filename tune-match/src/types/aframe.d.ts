import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any;
      "a-camera": any;
      "a-entity": any;
      "a-text": any;
      "a-plane": any;
      "a-image": any;
    }
  }
}