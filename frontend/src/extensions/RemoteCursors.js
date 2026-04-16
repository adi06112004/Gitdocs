import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const cursorPluginKey = new PluginKey("remoteCursors");

export const RemoteCursors = Extension.create({
  name: "remoteCursors",

  addOptions() {
    return {
      cursors: [] // Initial array of cursor objects: { userId, name, color, position }
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: cursorPluginKey,
        state: {
          init() { 
            return DecorationSet.empty; 
          },
          apply(tr, oldState) {
            // Apply cursor updates if meta is provided
            const meta = tr.getMeta(cursorPluginKey);
            
            if (meta) {
              const { cursors } = meta;
              const decos = [];

              cursors.forEach(cursor => {
                if (cursor.position === null || cursor.position === undefined) return;
                
                // Ensure position is within bounds
                const pos = Math.max(0, Math.min(cursor.position, tr.doc.content.size));

                const widgetMarker = document.createElement('span');
                widgetMarker.classList.add('remote-cursor-container');
                widgetMarker.style.position = 'relative';
                widgetMarker.style.display = 'inline-block';
                widgetMarker.style.height = '1em';
                widgetMarker.style.width = '0px';
                
                const cursorStick = document.createElement('span');
                cursorStick.classList.add('remote-cursor-stick');
                cursorStick.style.backgroundColor = cursor.color;
                
                const label = document.createElement('div');
                label.classList.add('remote-cursor-label');
                label.style.backgroundColor = cursor.color;
                label.textContent = cursor.name;

                widgetMarker.appendChild(cursorStick);
                widgetMarker.appendChild(label);

                decos.push(Decoration.widget(pos, widgetMarker, {
                  side: 1, // Draw to right of position
                  key: cursor.userId
                }));
              });

              return DecorationSet.create(tr.doc, decos);
            }
            
            // Otherwise naturally map existing decorations to document changes
            return oldState.map(tr.mapping, tr.doc);
          }
        },
        props: {
          decorations(state) {
            return cursorPluginKey.getState(state);
          }
        }
      })
    ];
  },

  addCommands() {
    return {
      updateCursors: (cursors) => ({ tr, dispatch }) => {
        if (dispatch) {
          tr.setMeta(cursorPluginKey, { cursors });
          return true;
        }
        return false;
      }
    };
  }
});
