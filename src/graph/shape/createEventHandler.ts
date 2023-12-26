import { GraphModel } from "../models/graphModel";
import { Shape } from "../types";
import { EventType } from "./constant";

export function createEventHandler(graph:GraphModel, props:{shape:Shape}) {
  return {
    click() {

      graph.emitter.emit(EventType.SHAPE_CLICK, window.event, props.shape);
    },
    mousedown() {

      graph.emitter.emit(EventType.SHAPE_MOUSE_DOWN, window.event, props.shape);
      // this.moved = false;
      // app.$bus.emit('close_contextMenu');
    },
    mouseup() {

      // debugger;
      graph.emitter.emit(EventType.SHAPE_MOUSE_UP, window.event, props.shape);

    },

    mousemove(event:MouseEvent) {
      //
      graph.emitter.emit(EventType.SHAPE_MOUSE_MOVE, event, props.shape);
      // this.moved = true;

    },
    // handleNameLabelClick(event:MouseEvent){
    //   graph.emitter.emit(EventType.NAME_LABEL_CLICK, event, props.shape);
    // },

    drop() {
      graph.emitter.emit(EventType.SHAPE_DRAG_DROP, window.event, props.shape);
    },

    dragover(event:DragEvent) {

      event.stopPropagation();
      event.preventDefault();
      graph.emitter.emit(EventType.SHAPE_DRAG_OVER, window.event, props.shape);

    },

    contextmenu(event: MouseEvent) {
      event.stopPropagation();
      graph.emitter.emit(EventType.SHAPE_CONTEXT_MENU, window.event, props.shape);
    },

    dblclick() {
      graph.emitter.emit(EventType.SHAPE_DBL_CLICK, window.event, props.shape);
    }

  };
}