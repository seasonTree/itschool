// *************************************************************
// docs: http://gulpjs.com/
// npm install --global gulp-cli
// cd YOUR_PROJECT_DIR
// npm install

// *************************************************************

var gulp = require('gulp');
var less = require('gulp-less');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var pump = require('pump');
var del = require('del');
var path = require('path');
var exec = require('child_process').exec;
var through = require('through-gulp');
var treeKill = require('tree-kill');



var server_thread = null;


var killServer = function (callbackFun) {
    if (server_thread) {
        treeKill(server_thread.pid, 'SIGKILL', function () {
            console.log('SERVER KILLED');
            callbackFun();
        });
    } else {
        callbackFun();
    }
};

var startServer = function () {
    server_thread = exec('npm start', function (err, stdout, stderr) {
        console.log('SERVER STARTED');
    });
    server_thread.stdout.on('data', function (data) {
        var str = data.toString();
        str = str.substr(0, str.length - 1);
        console.log(str);
    });
    server_thread.stderr.on('data', function (data) {
        var str = data.toString();
        str = str.substr(0, str.length - 1);
        console.log(str);
    });
    server_thread.on('exit', function (code) {
        console.log('SERVER EXITTED. CODE: ', code);
    });
};

var restartServer = function () {
    killServer(function () {
        startServer();
    });
};



function pretreatment(extname) {
    switch(extname) {
        case '.js':
            return uglify();
        case '.less':
            return less();
        case '.htm':
        case '.html':
            return htmlmin({
                removeComments: true,
                collapseWhitespace: true,
                minifyJS: true,
                minifyCSS: true
            });
        default:
            return null;
    }
};


var get_dest_path = function (src) {
    var str0 = path.resolve('public_dev');
    var str1 = path.relative(str0, src);
    var str2 = path.resolve('public', str1);
    return str2;
};

var copy_to_dest = function (src) {
    var extension = path.extname(src);
    var ary = [gulp.src(src, { base: 'public_dev' })];
    var pres = pretreatment(extension);

    if (pres) {
        ary.push(pres);
    }
    switch (extension) {
        case '.less':
            ary.push(mincss());
            break;
    }
    ary.push(gulp.dest('public'));

    pump(ary, function (err) {
        if (err) {
            console.log('PUMP ERR:');
            console.log(arguments);
        }
    });
};


gulp.task('watch', function () {
    restartServer();

    var watcher = gulp.watch([
        // 'public_dev/css/fw.less',
		'public_dev/**/*.js',
        'public_dev/css/*.less',
        'public_dev/_mg/**/*.{js,htm,html}',
        'public_dev/**/*.{htm,html}',
        'public_dev/**/*.{jpg,png,gif,ico}'
    ], gulp.parallel(function (done) {
        done();
    }));

    watcher.on('add', function (src, stats) {
        copy_to_dest(src, stats);
    });

    watcher.on('change', function (src, stats) {
        copy_to_dest(src, stats);
    });

    watcher.on('unlink', function (src) {
        var dest_path = get_dest_path(src);
        del.sync(dest_path);
    });

    watcher.on('unlinkDir', function (path) {
        var dest_path = get_dest_path(src);
        del.sync(dest_path);
    });

    watcher.on('error', function () {
        console.log('ERROR');
        console.log(arguments);
    });
});

gulp.task('watch_server_files', function () {
    var watcher = gulp.watch([
        'api/**/*.*',
        'bll/**/*.*',
        'dal/**/*.*',
        'node_modules/**/*.*',
        'routes/**/*.*',
        'app.js',
        'AppTimer.js',
        'CacheManager.js',
        'Helper.js',
        'cnf.js'], gulp.parallel(function (done) {
            restartServer();
            done();
        }));
});


gulp.task('minUIRouter', function (done) {
    gulp.src('public/jslib/angular-ui-router.js', { base: 'public' }).pipe(pretreatment('.js')).pipe(rename({ suffix: '.min' })).pipe(gulp.dest('public'));
    done();
});


gulp.task('init', function (done) {
    // gulp.src(['public_dev/css/fw.less'], { base: 'public_dev' }).pipe(pretreatment('.less')).pipe(gulp.dest('public'));
    gulp.src(['public_dev/css/*.less'], { base: 'public_dev' }).pipe(pretreatment('.less')).pipe(mincss()).pipe(gulp.dest('public'));
    gulp.src('public_dev/**/*.js', { base: 'public_dev' }).pipe(pretreatment('.js')).pipe(gulp.dest('public'));
    gulp.src('public_dev/_mg/**/*.js', { base: 'public_dev' }).pipe(pretreatment('.js')).pipe(gulp.dest('public'));
    gulp.src('public_dev/**/*.{htm,html}', { base: 'public_dev' }).pipe(pretreatment('.htm')).pipe(gulp.dest('public'));
	gulp.src('public_dev/**/*.{jpg,png,gif,ico}', { base: 'public_dev' }).pipe(gulp.dest('public'));
	done();
});


gulp.task('default', gulp.parallel('watch', 'watch_server_files'));
