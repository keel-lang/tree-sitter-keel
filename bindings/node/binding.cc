#include "nan.h"
#include "tree_sitter/parser.h"

extern "C" TSLanguage *tree_sitter_keel();

NAN_METHOD(New) {}

NAN_MODULE_INIT(Init) {
  auto *exports_obj = Nan::To<v8::Object>(exports).ToLocalChecked();
  auto *obj = Nan::New<v8::Object>();
  Nan::Set(obj, Nan::New("name").ToLocalChecked(),
           Nan::New("keel").ToLocalChecked());
  Nan::Set(obj, Nan::New("language").ToLocalChecked(),
           Nan::New<v8::External>(tree_sitter_keel()));
  Nan::Set(exports_obj, Nan::New("language").ToLocalChecked(), obj);
}

NODE_MODULE(tree_sitter_keel_binding, Init)
