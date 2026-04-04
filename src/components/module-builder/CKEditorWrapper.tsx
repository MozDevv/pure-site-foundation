import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorWrapperProps {
  data: string;
  onChange: (data: string) => void;
}

const CK_TOOLBAR = [
  'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', 'code', '|',
  'link', 'bulletedList', 'numberedList', '|', 'blockQuote', 'horizontalLine', '|',
  'insertTable', 'mediaEmbed', '|', 'codeBlock', '|', 'undo', 'redo', 'removeFormat',
];

export default function CKEditorWrapper({ data, onChange }: CKEditorWrapperProps) {
  return (
    <CKEditor
      editor={ClassicEditor as any}
      data={data}
      onChange={(_: any, editor: any) => {
        onChange(editor.getData());
      }}
      config={{ toolbar: CK_TOOLBAR } as any}
    />
  );
}
