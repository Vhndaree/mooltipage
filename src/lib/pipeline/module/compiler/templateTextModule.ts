import { HtmlCompileData, EvalContext, TextNode, TagNode, HtmlCompilerModule } from '../../..';

/**
 * Compile module that detects and evalutates embedded JS expressions in attributes and text nodes
 */
export class TemplateTextModule implements HtmlCompilerModule {
    enterNode(compileData: HtmlCompileData): void {
        if (TextNode.isTextNode(compileData.node)) {
            this.processTextNode(compileData, compileData.node);
        } else if (TagNode.isTagNode(compileData.node)) {
            this.processTagNode(compileData, compileData.node);
        }
    }

    private processTextNode(compileData: HtmlCompileData, node: TextNode): void {
        // create eval context from the current scope
        const evalContext: EvalContext = compileData.createEvalContext();

        // compile text
        const newText = this.compileToText(compileData, node.text, evalContext);
        node.text = newText;
    }

    private processTagNode(compileData: HtmlCompileData, node: TagNode): void {
        // create eval context from the current scope
        const evalContext: EvalContext = compileData.createEvalContext();

        // loop through each attribute and compile it
        for (const entry of Array.from(node.getAttributes().entries())) {
            const key = entry[0];
            const value = entry[1];

            if (typeof(value) === 'string') {
                // compile the value, preserving the raw output and not converting to a string
                const result: unknown = compileData.pipeline.compileDomText(value, evalContext);

                node.setRawAttribute(key, result);
            }
        }
    }

    private compileToText(compileData: HtmlCompileData, text: string, evalContext: EvalContext): string {
        const result: unknown = compileData.pipeline.compileDomText(text, evalContext);

        if (result == null) {
            return '';
        }

        return String(result);
    }
}