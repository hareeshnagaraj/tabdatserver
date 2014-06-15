// Generated by CoffeeScript 2.0.0-beta8
var CoffeeScript, formatSourcePosition, Module, patched, patchStackTrace, path, runMain, runModule, SourceMapConsumer;
path = require('path');
Module = require('module');
CoffeeScript = require('./module');
SourceMapConsumer = require('source-map').SourceMapConsumer;
patched = false;
patchStackTrace = function () {
  if (patched)
    return;
  patched = true;
  if (null != Module._sourceMaps)
    Module._sourceMaps;
  else
    Module._sourceMaps = {};
  return Error.prepareStackTrace = function (err, stack) {
    var frame, frames, getSourceMapping, sourceFiles;
    sourceFiles = {};
    getSourceMapping = function (filename, line, column) {
      var mapString, sourceMap;
      mapString = 'function' === typeof Module._sourceMaps[filename] ? Module._sourceMaps[filename]() : void 0;
      if (mapString) {
        sourceMap = null != sourceFiles[filename] ? sourceFiles[filename] : sourceFiles[filename] = new SourceMapConsumer(mapString);
        return sourceMap.originalPositionFor({
          line: line,
          column: column
        });
      }
    };
    frames = function (accum$) {
      for (var i$ = 0, length$ = stack.length; i$ < length$; ++i$) {
        frame = stack[i$];
        if (frame.getFunction() === exports.runMain)
          break;
        accum$.push('  at ' + formatSourcePosition(frame, getSourceMapping));
      }
      return accum$;
    }.call(this, []);
    return '' + err.name + ': ' + (null != err.message ? err.message : '') + '\n' + frames.join('\n') + '\n';
  };
};
formatSourcePosition = function (frame, getSourceMapping) {
  var as, column, fileLocation, fileName, functionName, isConstructor, isMethodCall, line, methodName, source, tp, typeName;
  fileName = void 0;
  fileLocation = '';
  if (frame.isNative()) {
    fileLocation = 'native';
  } else {
    if (frame.isEval()) {
      fileName = frame.getScriptNameOrSourceURL();
      if (!fileName)
        fileLocation = '' + frame.getEvalOrigin() + ', ';
    } else {
      fileName = frame.getFileName();
    }
    fileName || (fileName = '<anonymous>');
    line = frame.getLineNumber();
    column = frame.getColumnNumber();
    source = getSourceMapping(fileName, line, column);
    fileLocation = source ? '' + fileName + ':' + source.line + ':' + (source.column + 1) + ', <js>:' + line + ':' + column : '' + fileName + ':' + line + ':' + column;
  }
  functionName = frame.getFunctionName();
  isConstructor = frame.isConstructor();
  isMethodCall = !(frame.isToplevel() || isConstructor);
  if (isMethodCall) {
    methodName = frame.getMethodName();
    typeName = frame.getTypeName();
    if (functionName) {
      tp = as = '';
      if (typeName && functionName.indexOf(typeName))
        tp = '' + typeName + '.';
      if (methodName && functionName.indexOf('.' + methodName) !== functionName.length - methodName.length - 1)
        as = ' [as ' + methodName + ']';
      return '' + tp + functionName + as + ' (' + fileLocation + ')';
    } else {
      return '' + typeName + '.' + (methodName || '<anonymous>') + ' (' + fileLocation + ')';
    }
  } else if (isConstructor) {
    return 'new ' + (functionName || '<anonymous>') + ' (' + fileLocation + ')';
  } else if (functionName) {
    return '' + functionName + ' (' + fileLocation + ')';
  } else {
    return fileLocation;
  }
};
runMain = function (csSource, jsSource, jsAst, filename) {
  var mainModule;
  mainModule = new Module('.');
  mainModule.filename = process.argv[1] = filename;
  process.mainModule = mainModule;
  Module._cache[mainModule.filename] = mainModule;
  mainModule.paths = Module._nodeModulePaths(path.dirname(filename));
  return runModule(mainModule, jsSource, jsAst, filename);
};
runModule = function (module, jsSource, jsAst, filename) {
  patchStackTrace();
  Module._sourceMaps[filename] = function () {
    return '' + CoffeeScript.sourceMap(jsAst, filename);
  };
  return module._compile(jsSource, filename);
};
module.exports = {
  runMain: runMain,
  runModule: runModule
};