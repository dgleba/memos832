import { timestampDate } from "@bufbuild/protobuf/wkt";

// import { useState } from "react";
import { Button } from "@/components/ui/button";

import { BookmarkIcon, Target } from "lucide-react";

import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useNavigateTo from "@/hooks/useNavigateTo";

import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { Visibility } from "@/types/proto/api/v1/memo_service_pb";
import type { User } from "@/types/proto/api/v1/user_service_pb";
import { useTranslate } from "@/utils/i18n";
import { convertVisibilityToString } from "@/utils/memo";
import MemoActionMenu from "../../MemoActionMenu";
import { ReactionSelector } from "../../MemoReactionListView";
import UserAvatar from "../../UserAvatar";
import VisibilityIcon from "../../VisibilityIcon";
import { useMemoActions } from "../hooks";
import { useMemoViewContext, useMemoViewDerived } from "../MemoViewContext";
import type { MemoHeaderProps } from "../types";

const MemoHeader: React.FC<MemoHeaderProps> = ({ showCreator, showVisibility, showPinned }) => {
  const t = useTranslate();
  const [reactionSelectorOpen, setReactionSelectorOpen] = useState(false);

  const { memo, creator, currentUser, parentPage, isArchived, readonly, openEditor } = useMemoViewContext();
  const { relativeTimeFormat } = useMemoViewDerived();
  
  // # David Gleba 2026-04-25_Sat_17.09-PM 
  /* const handleFocusModeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Monkey patch the memo object in memory
    (memo as any)._triggerFocus = true;
    onEdit();
  }; */

	const handleFocusModeClick = (e: React.MouseEvent) => {
	  e.stopPropagation();
	  (memo as any)._triggerFocus = true;
	  openEditor(); // <--- FIXED: Use openEditor from context
	};

  const navigateTo = useNavigateTo();
  const handleGotoMemoDetailPage = useCallback(() => {
    navigateTo(`/${memo.name}`, { state: { from: parentPage } });
  }, [memo.name, parentPage, navigateTo]);

  const { unpinMemo } = useMemoActions(memo);


  const displayTime = isArchived ? (
    (memo.displayTime ? timestampDate(memo.displayTime) : undefined)?.toLocaleString(i18n.language)
  ) : (
    <relative-time
      datetime={(memo.displayTime ? timestampDate(memo.displayTime) : undefined)?.toISOString()}
      lang={i18n.language}
      format={relativeTimeFormat}
    ></relative-time>
  );

  return (
    <div className="w-full flex flex-row justify-between items-center gap-2">
      <div className="w-auto max-w-[calc(100%-8rem)] grow flex flex-row justify-start items-center">
        {showCreator && creator ? (
          <CreatorDisplay creator={creator} displayTime={displayTime} onGotoDetail={handleGotoMemoDetailPage} />
        ) : (
          <TimeDisplay displayTime={displayTime} onGotoDetail={handleGotoMemoDetailPage} />
        )}
      </div>

      <div className="flex flex-row justify-end items-center select-none shrink-0 gap-2">
        {currentUser && !isArchived && (
          <ReactionSelector
            className={cn("border-none w-auto h-auto", reactionSelectorOpen && "block!", "block sm:hidden sm:group-hover:block")}
            memo={memo}
            onOpenChange={setReactionSelectorOpen}
          />
        )}

        {showVisibility && memo.visibility !== Visibility.PRIVATE && (
          <Tooltip>
            <TooltipTrigger>
              <span className="flex justify-center items-center rounded-md hover:opacity-80">
                <VisibilityIcon visibility={memo.visibility} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {t(`memo.visibility.${convertVisibilityToString(memo.visibility).toLowerCase()}` as Parameters<typeof t>[0])}
            </TooltipContent>
          </Tooltip>
        )}

        {showPinned && memo.pinned && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer">
                  <BookmarkIcon className="w-4 h-auto text-primary" onClick={unpinMemo} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("common.unpin")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

		
        {!readonly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleFocusModeClick}
            title="Edit in Focus Mode"
          >
            <Target className="w-4 h-4" />
          </Button>
        )}

        

        <MemoActionMenu memo={memo} readonly={readonly} onEdit={openEditor} />


      </div>
    </div>
  );
};



interface CreatorDisplayProps {
  creator: any; // Ideally use the User type here
  displayTime: string;
  onGotoDetail: () => void;
  onEdit?: () => void; // 1. Added to Interface
}

const CreatorDisplay: React.FC<CreatorDisplayProps> = ({ 
  creator, 
  displayTime, 
  onGotoDetail, 
  onEdit // 2. Added to Destructuring
}) => (
  <div className="w-full flex flex-row justify-start items-center">
    <Link className="w-auto hover:opacity-80 rounded-md transition-colors" to={`/u/${encodeURIComponent(creator.username)}`} viewTransition>
      <UserAvatar className="mr-2 shrink-0" avatarUrl={creator.avatarUrl} />
    </Link>
    <div className="w-full flex flex-col justify-center items-start">
      <Link
        className="block leading-tight hover:opacity-80 rounded-md transition-colors truncate text-muted-foreground"
        to={`/u/${encodeURIComponent(creator.username)}`}
        viewTransition
      >
        {creator.displayName || creator.username}
      </Link>
      <button
        type="button"
        className="w-auto -mt-0.5 text-xs leading-tight text-muted-foreground select-none cursor-pointer hover:opacity-80 transition-colors text-left"
        onClick={() => {
          if (onEdit) onEdit(); // Use it here if needed
          onGotoDetail();
        }}
      >
        {displayTime}
      </button>
    </div>
  </div>
);

interface TimeDisplayProps {
  displayTime: React.ReactNode;
  onGotoDetail: () => void;
  onEdit?: () => void; // 3. Added to Interface
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  displayTime, 
  onGotoDetail, 
  onEdit // 4. Added to Destructuring
}) => (
  <button
    type="button"
    className="w-full text-sm leading-tight text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors text-left"
    onClick={() => {
      if (onEdit) onEdit(); // 5. Now 'onEdit' is defined and can be called safely
      onGotoDetail();
    }}
  >
    {displayTime}
  </button>
);


export default MemoHeader;
