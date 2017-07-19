'use strict';

import gulp     from 'gulp';
import path     from 'path';
import concat   from 'gulp-concat';
import replace  from 'gulp-replace';
import clean    from 'gulp-clean';
import sync     from 'run-sequence';
import rename   from 'gulp-rename';
import template from 'gulp-template';
import inject   from 'gulp-inject-string';
import merge    from 'merge-stream';
import fs       from 'fs';
import yargs    from 'yargs';
import lodash   from 'lodash';

let root = './';

// helper method for resolving paths
let resolveTo = {
    service: (glob) => path.join(root, 'src/services', glob || ''), 
    component: (glob) => path.join(root, 'src/components', glob || ''), 
    route: (glob) => path.join(root, 'src/routes', glob || ''),  
    app: (glob) => path.join(root, 'src', glob || ''), 
    globalSCSS: (glob) => path.join(root, 'src', glob || '') 
};

// map of all paths
let paths = {
  js: resolveTo.route('**/*!(.spec.js).js'), // exclude spec files
  html: [
    resolveTo.app('**/*.html'),
    path.join(root, 'index.html')
  ],
  entry: path.join(root, 'src/src.js'),
  output: root,
  componentBlankTemplates: path.join(__dirname, 'generator', 'component/**/*.**'),
  routeBlankTemplates: path.join(__dirname, 'generator', 'route/**/*.**'),
  serviceBlankTemplates: path.join(__dirname, 'generator', 'service/**/*.**')
};

let suffixes = {
    service: '.service',
    component: '.component',
    route: ''
};

let isAppendCSS = {
    service: false,
    component: true,
    route: true 
};
gulp.task('generate', () => {
  let name = yargs.argv.name;
  let type = yargs.argv.type || 'component';
  let parentPath = yargs.argv.parent || '';
  let typePath = resolveTo[type]();  
  let destPath = path.join(typePath, parentPath, name);
  let indexPath = path.join(typePath, parentPath, 'index.js');
  let scssPath = path.join(resolveTo.globalSCSS(), parentPath, 'index.scss');

  let addNewImportAndDependanciesToComponentsJS = gulp.src(indexPath)
    .pipe(inject.prepend(`import './${name}/${name}${suffixes[type]}';\n`))
    .pipe(replace(/TESTS = \[(.*)\]/, (match) => {
      const requireTest = `'./${name}/${name}.spec'`;
      if (match.match(/\[\]/)) {
        return match.replace(']', `${requireTest}]`);
      } else {
        return match.replace(']', `, ${requireTest}]`);
      }
    }))
    .pipe(clean({force: true}))
    .pipe(gulp.dest(typePath));

  let createNewComponentBasedOnTemplate = gulp.src(paths[`${type}BlankTemplates`])
    .pipe(template({
      name: name,
      upCaseName: lodash.capitalize(name)
    }))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('temp', name);
    }))
    .pipe(gulp.dest(destPath));
    
    if (isAppendCSS[type]) {
        let includeAdditionallSCSSFileInGlobalIndex = gulp.src(scssPath)
          .pipe(inject.append(`\n@import "~${type}s/${name}/${name}.scss";`))
          .pipe(clean({force: true}))
          .pipe(gulp.dest(resolveTo.globalSCSS()));    

      return merge(
        merge(addNewImportAndDependanciesToComponentsJS, createNewComponentBasedOnTemplate), 
        includeAdditionallSCSSFileInGlobalIndex
      );
    }
    return merge(addNewImportAndDependanciesToComponentsJS, createNewComponentBasedOnTemplate); 
});
