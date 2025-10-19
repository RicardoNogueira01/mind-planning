# Quick Reference: Popups Still Needing Restoration

## 1. NOTES POPUP - Code to Restore

**Location:** In expanded toolbar, replace notes button rendering

```jsx
<button
  ref={(el) => { notesBtnRefs.current[node.id] = el; }}
  className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
  onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'notes'); }}
  title="Add notes"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
</button>
{isPopupOpen(node.id, 'notes') && (() => {
  const anchor = notesBtnRefs.current[node.id];
  const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
  const popupWidth = 420;
  const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 8);
  return createPortal(
    <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000 }} onClick={(e) => e.stopPropagation()}>
      <textarea className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add your notes here..." value={node.notes || ''}
        onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, notes: e.target.value } : n))}
        onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
      <div className="mt-2 flex justify-end">
        <button className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); setNodes(nodes.map(n => n.id === node.id ? { ...n, showNotesPopup: false } : n)); }}>Close</button>
      </div>
    </div>,
    document.body
  );
})()}
```

---

## 2. EMOJI PICKER - Complete Implementation

**Location:** In expanded toolbar, add before settings toggle

```jsx
{isNodeToolbarExpanded(node.id) && (
  <button
    ref={(el) => { emojiBtnRefs.current[node.id] = el; }}
    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
    onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'emoji'); }}
    title="Add emoji"
  >
    😊
  </button>
)}

{isPopupOpen(node.id, 'emoji') && (() => {
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😜', '😛', '😜', '🤪', '😲', '😮', '😯', '😨', '😰', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'];
  const anchor = emojiBtnRefs.current[node.id];
  const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
  const popupWidth = 280;
  const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 8);
  return createPortal(
    <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000, backgroundColor: 'white', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-6 gap-1">
        {emojis.map(emoji => (
          <button
            key={emoji}
            className="p-1 text-lg hover:bg-gray-100 rounded cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setNodeEmoji(node.id, emoji); setNodes(nodes.map(n => n.id === node.id ? { ...n, showEmojiPopup: false } : n)); }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
})()}
```

---

## 3. TAGS POPUP - Restoration Pattern

```jsx
<button
  ref={(el) => { tagBtnRefs.current[node.id] = el; }}
  className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
  onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'tags'); }}
  title="Manage tags"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10h10V2z"></path>
    <path d="M19 8.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"></path>
  </svg>
</button>
{isPopupOpen(node.id, 'tags') && (() => {
  const anchor = tagBtnRefs.current[node.id];
  const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
  const popupWidth = 300;
  const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 8);
  return createPortal(
    <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000, maxHeight: '400px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <h4 className="font-medium mb-2 text-gray-800">Tags</h4>
      {/* Add tag form or list of existing tags with checkboxes */}
    </div>,
    document.body
  );
})()}
```

---

## 4. State Update Needed

Add to new node initialization in `addStandaloneNode` and other node creation functions:

```javascript
const newNode = {
  id: nodeId,
  text: 'New Node',
  x: 0,
  y: 0,
  color: '#ffffff',
  fontColor: '#2d3748',
  // ADD THESE:
  showAttachmentPopup: false,
  showEmojiPopup: false,
  showBgColorPopup: false,
  showFontColorPopup: false,
  showNotesPopup: false,
  showTagsPopup: false,
  showDetailsPopup: false,
  showDatePopup: false,
  showCollaboratorPopup: false,
  showLayoutPopup: false,
  emoji: '',
  notes: '',
  tags: [],
  priority: 'medium',
  status: 'not-started',
  description: '',
  dueDate: '',
  collaborators: [],
  attachments: [],
};
```

---

## 5. Pre-Refactor Reference - Extract Popup Code

To get the exact pre-refactor code for any popup:

```bash
# Get full popup implementation from git
git show 624a397:src/components/MindMap.jsx | grep -A 100 "showDetailsPopup && (() => {"

# Replace 'showDetailsPopup' with any of:
# - showDatePopup
# - showCollaboratorPopup
# - showTagsPopup
# - showEmojiPopup
```

---

## Implementation Order

**Suggested priority based on usage frequency:**

1. ✅ **Attachment** - DONE (file uploads critical)
2. 🔴 **Notes** - Most used (do next)
3. 🟠 **Emoji** - Quick win, improves UX
4. 🟠 **Tags** - Important for organization
5. 🟡 **Details** (Priority/Status) - Medium priority
6. 🟡 **Date** - Medium priority  
7. 🟡 **Colors** - Wire existing components
8. 🟢 **Collaborators** - Lower priority
9. 🟢 **Layout** - Root only, rarely used

---

## Quick Checklist Template for Each Popup

When implementing a new popup, verify:

- [ ] Button exists in toolbar
- [ ] Button ref added to `xBtnRefs.current[node.id]`
- [ ] Toggle handled with `togglePopup(node.id, 'popupName')`
- [ ] Popup state checked with `isPopupOpen(node.id, 'popupName')`
- [ ] Positioned using `createPortal` to `document.body`
- [ ] Position calculation prevents off-screen rendering
- [ ] Styling consistent with other popups (white bg, rounded, shadow)
- [ ] All inputs stop propagation with `onClick/onMouseDown/onFocus/onKeyDown`
- [ ] Close button (or close on outside click) toggles visibility
- [ ] State updates propagate to node data
- [ ] Tested in browser with multiple nodes
