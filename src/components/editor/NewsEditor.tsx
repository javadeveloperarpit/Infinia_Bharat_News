"use client";

import { useEffect, useRef } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

import {
  ClassicEditor,

  Essentials,
  Paragraph,
  Heading,

  Bold,
  Italic,
  Underline,
  Strikethrough,

  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,

  Link,
  AutoLink,

  List,

  BlockQuote,

  Image,
  ImageToolbar,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageInsert,
  ImageInsertViaUrl,

  Table,
  TableToolbar,

  MediaEmbed,

  Alignment,

  HorizontalLine,

  PasteFromOffice,

  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/* ---------------------------------------------
   Detect whether content is Markdown
--------------------------------------------- */

function looksLikeMarkdown(text: string) {
  if (!text) return false;

  return (
    /^#{1,6}\s/m.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /__[^_]+__/.test(text) ||
    /!\[[^\]]*\]\([^)]+\)/.test(text) ||
    /\[[^\]]+\]\([^)]+\)/.test(text) ||
    /^[-*+]\s/m.test(text) ||
    /^\d+\.\s/m.test(text) ||
    /^>\s/m.test(text) ||
    /^---$/m.test(text)
  );
}

/* ---------------------------------------------
   Markdown → HTML
--------------------------------------------- */

async function markdownToHtml(text: string) {
  if (!text) return "";

  if (!looksLikeMarkdown(text)) {
    return text;
  }

  return await marked.parse(text);
}

export default function NewsEditor({
  value,
  onChange,
}: Props) {
  const convertedInitialValue = useRef(false);

  /*
   * Important:
   * AI content may arrive as Markdown.
   *
   * Convert it only once when the editor initially loads.
   */
  async function handleReady(editor: any) {
    if (
      convertedInitialValue.current ||
      !value
    ) {
      return;
    }

    convertedInitialValue.current = true;

    try {
      const html = await markdownToHtml(value);

      if (html !== value) {
        editor.setData(html);

        onChange(html);
      }
    } catch (error) {
      console.error(
        "Markdown conversion error:",
        error
      );
    }

    /*
     * Also handle Markdown pasted directly
     * into CKEditor.
     */
    editor.editing.view.document.on(
      "clipboardInput",
      async (
        evt: any,
        data: any
      ) => {
        const text =
          data.dataTransfer.getData(
            "text/plain"
          );

        if (!text) return;

        if (!looksLikeMarkdown(text)) {
          return;
        }

        evt.stop();

        try {
          const html =
            await marked.parse(text);

          const viewFragment =
            editor.data.processor.toView(
              html
            );

          const modelFragment =
            editor.data.toModel(
              viewFragment
            );

          editor.model.change(
            (writer: any) => {
              editor.model.insertContent(
                modelFragment,
                editor.model.document.selection
              );
            }
          );
        } catch (error) {
          console.error(
            "Markdown paste error:",
            error
          );
        }
      },
      {
        priority: "high",
      }
    );
  }

  /*
   * Reset conversion flag when a completely
   * new article/editor value is loaded.
   */
  useEffect(() => {
    convertedInitialValue.current = false;
  }, [value]);

  return (
    <div
      className="
        rounded-xl
        border
        bg-white
        min-h-[600px]
      "
    >
      <CKEditor
        editor={ClassicEditor}
        data={value}

        config={{
          licenseKey: "GPL",

          plugins: [
            Essentials,

            Paragraph,
            Heading,

            Bold,
            Italic,
            Underline,
            Strikethrough,

            FontSize,
            FontFamily,
            FontColor,
            FontBackgroundColor,

            Link,
            AutoLink,

            List,

            BlockQuote,

            Image,
            ImageToolbar,
            ImageCaption,
            ImageResize,
            ImageStyle,
            ImageInsert,
            ImageInsertViaUrl,

            Table,
            TableToolbar,

            MediaEmbed,

            Alignment,

            HorizontalLine,

            PasteFromOffice,

            Undo,
          ],

          toolbar: [
            "undo",
            "redo",

            "|",

            "heading",

            "|",

            "bold",
            "italic",
            "underline",
            "strikethrough",

            "|",

            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",

            "|",

            "alignment",

            "|",

            "bulletedList",
            "numberedList",

            "|",

            "link",

            "insertImage",

            "insertTable",

            "mediaEmbed",

            "blockQuote",

            "horizontalLine",
          ],

          image: {
            toolbar: [
              "imageTextAlternative",

              "|",

              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",

              "|",

              "linkImage",
            ],

            insert: {
              integrations: [
                "url",
              ],
            },
          },

          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },

              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class:
                  "ck-heading_heading1",
              },

              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class:
                  "ck-heading_heading2",
              },

              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class:
                  "ck-heading_heading3",
              },
            ],
          },
        }}

        onReady={handleReady}

        onChange={(_, editor) => {
          const data =
            editor.getData();

          onChange(data);
        }}
      />
    </div>
  );
}

