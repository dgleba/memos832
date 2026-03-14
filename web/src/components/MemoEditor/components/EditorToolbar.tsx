// /am/cruc4tb/ap/dkr/code/usememos832d/memos832d/web/src/components/MemoEditor/components/EditorToolbar.tsx
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@/utils/i18n";
import { validationService } from "../services";
import { useEditorContext } from "../state";
import InsertMenu from "../Toolbar/InsertMenu";
import VisibilitySelector from "../Toolbar/VisibilitySelector";
import type { EditorToolbarProps } from "../types";
import { Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EditorToolbar: FC<EditorToolbarProps> = ({ onSave, onCancel, memoName }) => {
  const t = useTranslate();
  const navigate = useNavigate();

  const { state, actions, dispatch } = useEditorContext();
  const { valid } = validationService.canSave(state);

  const isSaving = state.ui.isLoading.saving;

  const handleLocationChange = (location: typeof state.metadata.location) => {
    dispatch(actions.setMetadata({ location }));
  };

  const handleToggleFocusMode = () => {
    dispatch(actions.toggleFocusMode());
  };

  const handleVisibilityChange = (visibility: typeof state.metadata.visibility) => {
    dispatch(actions.setMetadata({ visibility }));
  };

    // New: open new unsaved memo in dedicated focus-mode page.  2026-03-03_Tue_20.02-PM
	const openFocusModePage = () => {
	  const rawId = state.metadata.id;
	  // Ensure we are consistent
	  const memoId = rawId ? String(rawId).split('/').pop() : null;
	  
	  console.log("Navigating to Focus Mode for ID [52] : "); 
	  if (memoId) {
		navigate(`/m/${memoId}?view=focus`);
	  } else {
		dispatch(actions.toggleFocusMode());
	  }
	};


  return (
    <div className="w-full flex flex-row justify-between items-center mb-2">
      <div className="flex flex-row justify-start items-center">
        <InsertMenu
          isUploading={state.ui.isLoading.uploading}
          location={state.metadata.location}
          onLocationChange={handleLocationChange}
          onToggleFocusMode={handleToggleFocusMode}
          memoName={memoName}
        />
      </div>

      <div className="flex flex-row justify-end items-center gap-2">
        {/* New Focus Mode button */}
        <Button
          variant="ghost"
          onClick={openFocusModePage}
          title={t("editor.focusMode") ?? "Focus Mode"}
        >
          <Target className="w-4 h-4" />
        </Button>

        <VisibilitySelector
          value={state.metadata.visibility}
          onChange={handleVisibilityChange}
        />

        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
        )}

        <Button onClick={onSave} disabled={!valid || isSaving}>
          {isSaving ? t("editor.saving") : t("editor.save")}
        </Button>
      </div>
    </div>
  );
};
