/**
 * Copyright
 */

import React from "react";
import { IContent } from "matrix-js-sdk/src/models/event";
import { logger } from "matrix-js-sdk/src/logger";

import * as StorageManager from "../../../utils/StorageManager";
import EditorStateTransfer from "../../../utils/EditorStateTransfer";
import { withMatrixClientHOC, MatrixClientProps } from "../../../contexts/MatrixClientContext";
import RoomContext from "../../../contexts/RoomContext";
import { translatorRoomKey, translatorStateKey } from "../../../Editing";

interface ITranslateMessageComposerProps extends MatrixClientProps {
    translateState: EditorStateTransfer;
    translateContent: IContent;
    className?: string;
}
interface IState {
    content: string | undefined;
}

class TranslateMessageComposer extends React.Component<ITranslateMessageComposerProps, IState> {
    public static contextType = RoomContext;
    public context!: React.ContextType<typeof RoomContext>;

    public constructor(props: ITranslateMessageComposerProps, context: React.ContextType<typeof RoomContext>) {
        super(props);

        this.state = {
            content: undefined,
        };
    }

    // private get translatorRoomKey(): string {
    //     return translatorRoomKey(this.props.translateState.getEvent().getRoomId(), this.context.timelineRenderingType);
    // }

    private get translatorStateKey(): string {
        return translatorStateKey(
            this.props.translateState.getEvent().getRoomId(),
            this.props.translateState.getEvent().getId(),
        );
    }

    private async restoreStoredTranslatorState(): Promise<string | undefined> {
        const stateKey = this.translatorStateKey;
        try {
            return (await StorageManager.idbLoad("translate_list", stateKey)) as string;
        } catch (error) {
            logger.error("get translate content to IndexedDB failed", error);
            return undefined;
        }
    }

    private async getTranslateContent(): Promise<string> {
        const oldState = await this.restoreStoredTranslatorState();
        if (oldState) {
            return oldState;
        }
        try {
            const item = `${this.props.translateContent.body} translating...`;
            // await StorageManager.idbSave(
            //     "translate_list",
            //     this.translatorRoomKey,
            //     this.props.translateState.getEvent().getId(),
            // );
            await StorageManager.idbSave("translate_list", this.translatorStateKey, item);
            return item;
        } catch (error) {
            logger.error("set translate content to IndexedDB failed", error);
        }
        // localStorage.setItem(this.translatorRoomKey, this.props.translateState.getEvent().getId());
        // localStorage.setItem(this.translatorStateKey, item);
    }

    public async componentDidMount(): Promise<void> {
        const content = await this.getTranslateContent();
        this.setState({ content });
    }

    public render(): React.ReactNode {
        const { content } = this.state;
        return <div>{content}</div>;
    }
}

const TranslateMessageComposerWithMatrixClient = withMatrixClientHOC(TranslateMessageComposer);
export default TranslateMessageComposerWithMatrixClient;
