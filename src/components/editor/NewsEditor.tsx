"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { marked } from "marked";
marked.setOptions({
gfm:true,
breaks:true
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

  Undo
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

interface Props {

  value: string;

  onChange: (value: string) => void;

}


export default function NewsEditor({

  value,

  onChange

}: Props) {

  return (

    <div className="
rounded-xl
overflow-hidden
border
bg-white
min-h-[600px]
">

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


            Undo

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


            "horizontalLine"

          ],



          image: {


            toolbar: [

              "imageTextAlternative",

              "|",

              "imageStyle:inline",

              "imageStyle:block",

              "imageStyle:side",

              "|",

              "linkImage"

            ],



            insert: {

              integrations: [

                "url"

              ]

            }


          },



          heading: {

            options: [

              {

                model:"paragraph",

                title:"Paragraph",

                class:"ck-heading_paragraph"

              },


              {

                model:"heading1",

                view:"h1",

                title:"Heading 1",

                class:"ck-heading_heading1"

              },


              {

                model:"heading2",

                view:"h2",

                title:"Heading 2",

                class:"ck-heading_heading2"

              },


              {

                model:"heading3",

                view:"h3",

                title:"Heading 3",

                class:"ck-heading_heading3"

              }

            ]

          }

        }}
        onReady={(editor)=>{


editor.editing.view.document.on(
"clipboardInput",
async (evt,data)=>{


const text =
data.dataTransfer.getData(
"text/plain"
);


if(
text.includes("#") ||
text.includes("**") ||
text.includes("---")
){


evt.stop();


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



editor.model.change(writer=>{


editor.model.insertContent(
modelFragment,
editor.model.document.selection
);


});


}


},
{
priority:"high"
}

);


}}
                onChange={(_, editor)=>{

          const data = editor.getData();

          onChange(data);

        }}

      />

    </div>

  );

}