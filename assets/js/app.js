const electron = require('electron');
const remote = electron.remote;
const dialog = remote.dialog;
const fs = require('fs');
const session = remote.session;
const needle = require('needle');
const prompt = require('dialogs')(opts={});
const mkdirp = require('mkdirp');
const homedir  = require('os').homedir();
const sanitize = require("sanitize-filename");
var Downloader = require('mt-files-downloader');
var shell = require('electron').shell;
var https = require('https');

remote.getCurrentWindow().on('close', function() {
  saveDownloads();
});

var subDomain = 'www';
var businessDomain = $('.ui.login #subdomain');

$('.ui.dropdown')
  .dropdown()
;

jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};


var downloadTemplate = `
<div class="ui tiny icon action buttons">
  <button class="ui basic blue download button"><i class="download icon"></i></button>
  <button class="ui disabled basic red pause button"><i class="pause icon"></i></button>
  <button class="ui disabled basic green resume button"><i class="play icon"></i></button>
</div>
<div class="ui horizontal divider"></div>
<div class="ui tiny indicating individual progress">
   <div class="bar"></div>
</div>
<div class="ui horizontal divider"></div>
<div class="ui small indicating combined progress">
  <div class="bar">
    <div class="progress"></div>
  </div>
<div class="label">${translate("Building Course Data")}</div>
</div>
`;

$('.ui.login #business').change(function() {
    if($(this).is(":checked")) {
        businessDomain.show();
    } else {
        businessDomain.hide();
    }
});

$('.ui.login .form').submit((e)=>{
e.preventDefault();
var email = $(e.target).find('input[name="email"]').val();
var password = $(e.target).find('input[name="password"]').val();
var isBusiness = $(e.target).find('input[name="business"]').is(":checked");

if(isBusiness){
    subDomain = $(e.target).find('input[name="subdomain"]').val() || subDomain;
}

if(!email || !password){
   prompt.alert(translate("Type Username/Password"));
   return;
}

$.ajax({
   type: 'GET',
   url:'https://www.udemy.com/join/login-popup',
   beforeSend: function(){
     $(".ui.login .dimmer").addClass('active');
   },
    success: function(data, status, xhr){
    var token = $('input[name=csrfmiddlewaretoken]',data).val();
    var cookie = '';
    session.defaultSession.cookies.get({url: 'https://www.udemy.com'}, (error, cookies) => {
  for (var key in cookies){
    cookie +=  cookies[key].name+'='+cookies[key].value+';';
  }

needle
   .post('https://www.udemy.com/join/login-popup/?ref=&display_type=popup&locale=en_US&response_type=json&next=https%3A%2F%2Fwww.udemy.com%2F&xref=', {email:email,password:password,csrfmiddlewaretoken:token,locale:'en_US'}, {headers: {'Cookie': cookie,'Referer': 'https://www.udemy.com/','Host': 'www.udemy.com','X-Requested-With': 'XMLHttpRequest','User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'}})
   .on('readable', function() {
      $(".ui.login .dimmer").removeClass('active');
      if(this.request.res.cookies.access_token){
         $('.ui.login').slideUp('fast');
         $('.ui.dashboard').fadeIn('fast').css('display','flex');
      var access_token = this.request.res.cookies.access_token;
      var header = {"Authorization": `Bearer ${access_token}`};

      $.ajax({
               type: 'GET',
               url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50`,
               beforeSend: function(){
                   $(".ui.dashboard .courses.dimmer").addClass('active');
               },
               headers: header,
               success: function(response){
                  handleResponse(response,header);
               }
            });
      }else{
         prompt.alert(translate('Incorrect Username/Password'));
      }


$('.ui.dashboard .content').on('click','.download-success', function(){
$(this).hide();
$(this).parents('.course').find('.download-status').show();
});

$('.ui.dashboard .content').on('click','.load-more.button', function(){
var $this = $(this);
var $courses = $this.prev('.courses.items');
      $.ajax({
               type: 'GET',
               url: $this.data('url'),
               beforeSend: function(){
                   $(".ui.dashboard .courses.dimmer").addClass('active');
               },
               headers: header,
               success: function(response) {
                $(".ui.dashboard .courses.dimmer").removeClass('active');
                $.each(response.results,function(index,course){
                        $(`<div class="ui course item" course-id="${course.id}" course-url="${course.url}">
                                <div class="ui tiny label download-quality grey"></div>
                                <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                                  <div class="ui tiny image">
                                    <img src="${course.image_240x135}">
                                  </div>
                                  <div class="content">
                                    <span class="coursename">${course.title}</span>

                                  <div class="ui tiny icon green download-success message">
                                         <i class="check icon"></i>
                                          <div class="content">
                                            <div class="header">
                                               ${translate("Download Completed")}
                                             </div>
                                             <p>${translate("Click to dismiss")}</p>
                                           </div>
                                    </div>

                                  <div class="ui tiny icon  red download-error message">
                                         <i class="power icon"></i>
                                          <div class="content">
                                            <div class="header">
                                               ${translate("Download Failed")}
                                             </div>
                                             <p>${translate("Click to retry")}</p>
                                           </div>
                                    </div>

                                    <div class="extra download-status">
                                      ${downloadTemplate}
                                    </div>

                                  </div>
                                </div>
                        `).appendTo($courses);
                     });
                    if(!response.next){
                      $this.remove();
                    }else{
                      $this.data('url',response.next);
                    }
               }
      });
});


$('.ui.dashboard .content').on('click','.check-updates', function(){
  $(".ui.dashboard .about.dimmer").addClass('active');
  $.getJSON('https://api.github.com/repos/FaisalUmair/udemy-downloader-gui/releases/latest', function(response){
    $(".ui.dashboard .about.dimmer").removeClass('active');
    if(response.tag_name!=`v${appVersion}`){
      $('.ui.update-available.modal').modal('show');
    }else{
      prompt.alert('No updates available');
    }
  });
});


$('.ui.dashboard .content .courses.section .search.form').submit(function(e){
   e.preventDefault();
   var keyword = $(e.target).find('input').val();
   $.ajax({
    type: 'GET',
    url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50&page=1&fields[user]=job_title&search=${keyword}`,
    beforeSend: function(){
        $(".ui.dashboard .courses.dimmer").addClass('active');
    },
    headers: header,
    success: function(response) {
      handleResponse(response,header,keyword);
    }
   });
});


$('.ui.dashboard .content').on('click','.download.button, .download-error', function(event){
event.stopPropagation();
var $course = $(this).parents('.course');
var courseid = $course.attr('course-id');
$course.find('.download-error').hide();
$course.find('.download-status').show();
var settingsCached = settings.getAll();
var skipAttachments = settingsCached.download.skipAttachments;
var skipSubtitles = settingsCached.download.skipSubtitles;
      $.ajax({
               type: 'GET',
               url: `https://${subDomain}.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=100000`,
               beforeSend: function(){
                   $(".ui.dashboard .course.dimmer").addClass('active');
               },
               headers: header,
               success: function(response) {
                 $(".ui.dashboard .course.dimmer").removeClass('active');
                 $course.find('.download.button').addClass('disabled');
                 $course.css('padding-bottom','25px');
                 $course.find('.ui.progress').show();
                 var coursedata = [];
                 coursedata['chapters'] = [];
                 coursedata['name'] = $course.find('.coursename').text();
                 var chapterindex = -1;
                 var lectureindex = -1;
                 var remaining = response.count;
                 coursedata['totallectures'] = 0;

                 if(response.results[0]._class=="lecture"){
                         chapterindex++;
                         lectureindex = 0;
                         coursedata['chapters'][chapterindex] = [];
                         coursedata['chapters'][chapterindex]['name'] = 'Chapter 1';
                         coursedata['chapters'][chapterindex]['lectures'] = [];
                         remaining--;
                 }

                  $.each(response.results, function(i,v){
                    if(v._class=="chapter"){
                         chapterindex++;
                         lectureindex = 0;
                         coursedata['chapters'][chapterindex] = [];
                         coursedata['chapters'][chapterindex]['name'] = v.title;
                         coursedata['chapters'][chapterindex]['lectures'] = [];
                         remaining--;
                    }else if(v._class=="lecture"&& (v.asset.asset_type=="Video"||v.asset.asset_type=="Article"||v.asset.asset_type=="File"||v.asset.asset_type=="E-Book")){
                        if(v.asset.asset_type!="Video"&&skipAttachments){
                          remaining--;
                          if(!remaining){
                            initDownload($course,coursedata);
                          }
                          return;
                        }
                      function  getLecture(lecturename,chapterindex,lectureindex){
                          $.ajax({
                             type: 'GET',
                             url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}?fields[asset]=stream_urls,download_urls,captions,title,filename&fields[lecture]=asset,supplementary_assets`,
                             headers: header,
                             success: function(response) {
                                if(v.asset.asset_type=="Article"){
                                  var src = response.view_html;
                                  var videoQuality = v.asset.asset_type;
                                  var type = 'Article';
                                }else if((v.asset.asset_type=="File"||v.asset.asset_type=="E-Book")){
                                  var src = response.asset.download_urls[v.asset.asset_type][0].file;
                                  var videoQuality = v.asset.asset_type;
                                  var type = 'File';
                                }else{
                                var type = 'Video';
                                var lecture = response.asset.stream_urls;
                                var qualities = [];
                                var qualitySrcMap = {};
                                lecture.Video.forEach(function(val){
                                  if(val.label=="Auto")  return;
                                  qualities.push(val.label);
                                  qualitySrcMap[val.label] = val.file;
                                });
                                  var lowest =  Math.min(...qualities);
                                  var highest = Math.max(...qualities);
                                  var videoQuality = settingsCached.download.videoQuality;
                                  if(!videoQuality || videoQuality=="Auto"){
                                    var src = lecture.Video[0].file;
                                    videoQuality = lecture.Video[0].label;
                                  }else{
                                    switch(videoQuality){
                                      case 'Highest':
                                        var src = qualitySrcMap[highest];
                                        videoQuality = highest;
                                        break;
                                      case 'Lowest':
                                         var src = qualitySrcMap[lowest];
                                         videoQuality = lowest;
                                         break;
                                      default:
                                         videoQuality = videoQuality.slice(0, -1);
                                         var src = qualitySrcMap[videoQuality] ? qualitySrcMap[videoQuality] : lecture.Video[0].file;
                                    }
                                  }
                                }
                                coursedata['chapters'][chapterindex]['lectures'][lectureindex] = {src:src,name:lecturename,quality:videoQuality,type:type};
                                if(!skipSubtitles&&response.asset.captions.length){
                                  coursedata['chapters'][chapterindex]['lectures'][lectureindex].caption = response.asset.captions[0].url;
                                }
                                if(response.supplementary_assets.length&&!skipAttachments){
                                  coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'] = [];
                                  var supplementary_assets_remaining = response.supplementary_assets.length;
                                  $.each(response.supplementary_assets, function(a,b){
                                      $.ajax({
                                        type: 'GET',
                                        url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}/supplementary-assets/${b.id}?fields[asset]=download_urls,external_url,asset_type`,
                                        headers: header,
                                        success: function(response) {
                                          if(response.download_urls){
                                            coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].push({src:response.download_urls[response.asset_type][0].file,name:b.title,quality:'Attachment',type:'File'});
                                          }else{
                                            coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].push({src:`<script type="text/javascript">window.location = "${response.external_url}";</script>`,name:b.title,quality:'Attachment',type:'Url'});
                                          }
                                            supplementary_assets_remaining--;
                                            if(!supplementary_assets_remaining){
                                                remaining--;
                                                coursedata['totallectures']+=1;
                                                if(!remaining){
                                                  initDownload($course,coursedata);
                                                }
                                            }
                                        }
                                      });
                                  });
                                }else{
                                  remaining--;
                                  coursedata['totallectures']+=1;
                                  if(!remaining){
                                    initDownload($course,coursedata);
                                  }
                                }
                             }
                            });
                     }
                     getLecture(v.title,chapterindex,lectureindex);
                     lectureindex++;
                    }else if(!skipAttachments){
                       coursedata['chapters'][chapterindex]['lectures'][lectureindex] = {src:`<script type="text/javascript">window.location = "https://${subDomain}.udemy.com${$course.attr('course-url')}t/${v._class}/${v.id}";</script>`,name:v.title,quality:'Attachment',type:'Url'};
                       remaining--;
                       coursedata['totallectures']+=1;
                       if(!remaining){
                          initDownload($course,coursedata);
                        }
                      lectureindex++;
                    }else{
                      remaining--;
                      if(!remaining){
                        initDownload($course,coursedata);
                      }
                    }

                  });
               }
    });
});
});

});

}

});

});



function initDownload($course,coursedata){
  $clone = $course.clone();
  $downloads = $('.ui.downloads.section .ui.courses.items');
  $courses = $('.ui.courses.section .ui.courses.items');
  if($course.parents('.courses.section').length){
    $downloadItem = $downloads.find('[course-id='+$course.attr("course-id")+']');
    if($downloadItem.length){
      $downloadItem.replaceWith($clone);
    }else{
      $downloads.prepend($clone);
    }
  }else{
    $courseItem = $courses.find('[course-id='+$course.attr("course-id")+']');
    if($courseItem.length){
      $courseItem.replaceWith($clone);
    }
  }
  $course.push($clone[0]);
  var timer;
  var downloader = new Downloader();
  var $downloadStatus = $course.find('.download-status');
  var $actionButtons = $course.find('.action.buttons');
  var $downloadButton = $actionButtons.find('.download.button');
  var $pauseButton = $actionButtons.find('.pause.button');
  var $resumeButton = $actionButtons.find('.resume.button');
  var lectureChaperMap = {};
  var qualityColorMap = {'144':'red','240':'orange','360':'blue','480':'teal','720':'olive','1080':'green','Attachment':'pink','Subtitle':'black'};
  var currentLecture = 0;
  coursedata['chapters'].forEach(function(lecture,chapterindex){
  lecture['lectures'].forEach(function(x,lectureindex){
  currentLecture++;
  lectureChaperMap[currentLecture] = {chapterindex:chapterindex,lectureindex:lectureindex};
  });
  });

  var course_name = sanitize(coursedata['name']);
  var totalchapters = coursedata['chapters'].length;
  var totallectures = coursedata['totallectures'];
  var $progressElemCombined = $course.find('.combined.progress');
  var $progressElemIndividual = $course.find('.individual.progress');
  var settingsCached = settings.getAll();
  var download_directory = settingsCached.download.path || homedir+'/Downloads';
  var $download_speed = $course.find('.download-speed');
  var $download_speed_value = $download_speed.find('.value');
  var $download_quality = $course.find('.download-quality');
  var downloaded = 0;
  var downloadStart = settingsCached.download.downloadStart;
  var downloadEnd = settingsCached.download.downloadEnd;
  var enableDownloadStartEnd = settingsCached.download.enableDownloadStartEnd;
  $course.css('cssText','padding-top: 35px !important').css('padding-bottom','25px');


$pauseButton.click(function(){
downloader._downloads[downloader._downloads.length-1].stop();
$pauseButton.addClass('disabled');
$resumeButton.removeClass('disabled');
});

$resumeButton.click(function(){
downloader._downloads[downloader._downloads.length-1].resume();
$resumeButton.addClass('disabled');
$pauseButton.removeClass('disabled');
});


  if(enableDownloadStartEnd){

    if(downloadStart>downloadEnd){
      downloadStart=downloadEnd;
    }

    if(downloadStart<1){
      downloadStart = 1;
    }else if(downloadStart>totallectures){
      downloadStart = totallectures;
    }

    if(downloadEnd<1){
      downloadEnd = 1;
    }else if(downloadEnd>totallectures){
      downloadEnd = totallectures;
    }
    var toDownload = (downloadEnd-downloadStart)+1;
    downloadChapter(lectureChaperMap[downloadStart].chapterindex,lectureChaperMap[downloadStart].lectureindex);
  }else{
    var toDownload = totallectures;
    downloadChapter(0,0);
  }

  $progressElemCombined.progress({
    total    : toDownload,
    text     : {
      active: `${translate("Downloaded")} {value} ${translate("out of")} {total} ${translate("items")}`
    }
  });

$progressElemCombined.progress('reset');
$download_speed.show();
$download_quality.show();

function downloadChapter(chapterindex,lectureindex){

var num_lectures = coursedata['chapters'][chapterindex]['lectures'].length;
var chapter_name = sanitize((chapterindex+1)+'. '+coursedata['chapters'][chapterindex]['name']);
  mkdirp(download_directory+'/'+course_name+'/'+chapter_name, function(){
    downloadLecture(chapterindex,lectureindex,num_lectures,chapter_name);
  });
}

function downloadLecture(chapterindex,lectureindex,num_lectures,chapter_name){
  if(downloaded==toDownload){
      resetCourse($course.find('.download-success'));
      return;
  }else if(lectureindex==num_lectures){
      downloadChapter(++chapterindex,0);
      return;
    }

    function dlStart(dl,callback){

        // Change retry options to something more forgiving and threads to keep udemy from getting upset
          dl.setRetryOptions({
            retryInterval: 5000
          });

          dl.setOptions({
            threadsCount: 5
          });

          dl.start();
          // To track time and restarts
          let notStarted = 0;
          let reStarted = 0;

          timer = setInterval(function() {
              switch(dl.status){
                case 0:
                  // Wait a reasonable amount of time for the download to start and if it doesn't then start another one.
                  // once one of them starts the errors from the others will be ignored and we still get the file.
                  if(reStarted <= 5) {
                    notStarted++;
                    if (notStarted >= 15) {
                      dl.start();
                      notStarted = 0;
                      reStarted++;
                    }
                  }
                  $download_speed_value.html(0);
                  break;
                case 1:
                    var stats = dl.getStats();
                    $download_speed_value.html(parseInt(stats.present.speed/1000) || 0);
                    $progressElemIndividual.progress('set percent',stats.total.completed);
                    break;
                case 2:
                  break;
                case -1:
                  var stats = dl.getStats();
                  $download_speed_value.html(parseInt(stats.present.speed/1000) || 0);
                  $progressElemIndividual.progress('set percent',stats.total.completed);
                  if(dl.stats.total.size==0&&dl.status==-1&&fs.existsSync(dl.filePath)){
                    dl.emit('end');
                    clearInterval(timer);
                    break;
                  }else{
                      $.ajax({
                      type: 'HEAD',
                      url: dl.url,
                      error: function(error){
                        if(error.status==401){
                         fs.unlinkSync(dl.filePath);
                        }
                         resetCourse($course.find('.download-error'));
                      },
                      success: function(){
                        resetCourse($course.find('.download-error'));
                      }
                    });
                    clearInterval(timer);
                    break;
                  }
                default:
                  $download_speed_value.html(0);
              }
          }, 1000);

          dl.on('error', function(dl) {
            // Prevent throwing uncaught error
          });

          dl.on('start', function(){
            $pauseButton.removeClass('disabled');
          });

          dl.on('end', function() {
            callback();
          });
    }

    function downloadAttachments(index,total_assets){
        $progressElemIndividual.progress('reset');
        var lectureQuality = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['quality'];
        var lastClass = $download_quality.attr('class').split(' ').pop();
        $download_quality.html(lectureQuality).removeClass(lastClass).addClass(qualityColorMap[lectureQuality] || 'grey');

        if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['type']=='Article'||coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['type']=='Url'){
        fs.writeFile(download_directory+'/'+course_name+'/'+chapter_name+'/'+sanitize((lectureindex+1)+'.'+(index+1)+' '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['name'].trim()+'.html'), coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['src'], function() {
          index++;
          if(index==total_assets){
            $progressElemCombined.progress('increment');
            downloaded++;
            downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
          }else{
            downloadAttachments(index,total_assets);
          }
        });
      }else{
            var lecture_name = sanitize((lectureindex+1)+'.'+(index+1)+' '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['name'].trim()+'.'+new URL(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['src']).searchParams.get('filename').split('.').pop());
              if(fs.existsSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name+'.mtd')){
                var dl = downloader.resumeDownload(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
                if(!fs.statSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name+'.mtd').size){
                  dl = downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
                }
              }else if(fs.existsSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name)){
                endDownload();
                return;
              }else{
                var dl = downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
              }

              dlStart(dl,endDownload);
          
          function endDownload(){
              index++;
              $pauseButton.addClass('disabled');
              clearInterval(timer);
              if(index==total_assets){
              $progressElemCombined.progress('increment');
              downloaded++;
              downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
            }else{
              downloadAttachments(index,total_assets);
            }
          }

      }
    }

    function checkAttachment(){
      $progressElemIndividual.progress('reset');
      if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets']){
        var total_assets = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].length;
        var index = 0;
        downloadAttachments(index,total_assets);
      }else{
        $progressElemCombined.progress('increment');
        downloaded++;
        downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
      }
    }

    function downloadSubtitle(){
        $progressElemIndividual.progress('reset');
        var lastClass = $download_quality.attr('class').split(' ').pop();
        $download_quality.html('Subtitle').removeClass(lastClass).addClass(qualityColorMap['Subtitle'] || 'grey');
        var lecture_name = sanitize((lectureindex+1)+'. '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['name'].trim()+'.vtt');
        if(fs.existsSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name)){
          checkAttachment();
          return;
        }
        var file = fs.createWriteStream(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name).on('finish', function(){
          checkAttachment();
        });
        var request = https.get(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['caption'], function(response) {
          response.pipe(file);
        });
    }

$progressElemIndividual.progress('reset');

    var lectureQuality = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['quality'];
    var lastClass = $download_quality.attr('class').split(' ').pop();
    $download_quality.html(lectureQuality+(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='Video' ? 'p' : '')).removeClass(lastClass).addClass(qualityColorMap[lectureQuality] || 'grey');

    if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='Article'||coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='Url'){
      fs.writeFile(download_directory+'/'+course_name+'/'+chapter_name+'/'+sanitize((lectureindex+1)+'. '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['name'].trim()+'.html'), coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src'], function() {
          if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets']){
            var total_assets = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].length;
            var index = 0;
            downloadAttachments(index,total_assets);
          }else{
            $progressElemCombined.progress('increment');
            downloaded++;
            downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
          }

      });

    }else{

    var lecture_name = sanitize((lectureindex+1)+'. '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['name'].trim()+'.'+(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='File' ? new URL(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src']).searchParams.get('filename').split('.').pop() : 'mp4'));
    if(fs.existsSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name+'.mtd')){
      var dl = downloader.resumeDownload(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
      if(!fs.statSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name+'.mtd').size){
        dl = downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
      }
    }else if(fs.existsSync(download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name)){
      endDownload();
      return;
    }else{
      var dl = downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
    }
    
    dlStart(dl,endDownload);


function endDownload(){
    $pauseButton.addClass('disabled');
    clearInterval(timer);
    if(coursedata['chapters'][chapterindex]['lectures'][lectureindex].caption){
      downloadSubtitle();
    }else{
      checkAttachment();
    }
}

}

}

function resetCourse(Selem){
  $download_speed.hide();
  $download_quality.hide();
  $download_speed_value.html(0);
  $downloadStatus.hide().html(downloadTemplate);
  Selem.css('display','flex');
  $course.css('padding','14px 0px');
}

}

$('.courses-sidebar').click(function(){
  $('.content .ui.section').hide();
  $('.content .ui.courses.section').show();
  $(this).parent('.sidebar').find('.active').removeClass('active red');
  $(this).addClass('active red');
});

$('.downloads-sidebar').click(function(){
  $('.content .ui.section').hide();
  $('.content .ui.downloads.section').show();
  $(this).parent('.sidebar').find('.active').removeClass('active red');
  $(this).addClass('active red');
});

$('.settings-sidebar').click(function(){
  $('.content .ui.section').hide();
  $('.content .ui.settings.section').show();
  $(this).parent('.sidebar').find('.active').removeClass('active red');
  $(this).addClass('active red');
  loadSettings();
});

$('.about-sidebar').click(function(){
  $('.content .ui.section').hide();
  $('.content .ui.about.section').show();
  $(this).parent('.sidebar').find('.active').removeClass('active red');
  $(this).addClass('active red');
});


$('.download-update.button').click(function(){
shell.openExternal('https://github.com/FaisalUmair/udemy-downloader-gui/releases/latest');
});

$('.content .ui.about').on('click', 'a[href^="http"]', function(e) {
    e.preventDefault();
    shell.openExternal(this.href);
});


$('.ui.settings .form').submit((e)=>{
  e.preventDefault();
  var enableDownloadStartEnd = $(e.target).find('input[name="enabledownloadstartend"]')[0].checked;
  var skipAttachments = $(e.target).find('input[name="skipattachments"]')[0].checked;
  var skipSubtitles = $(e.target).find('input[name="skipsubtitles"]')[0].checked;
  var downloadStart = $(e.target).find('input[name="downloadstart"]').val();
  var downloadEnd = $(e.target).find('input[name="downloadend"]').val();
  var videoQuality = $(e.target).find('input[name="videoquality"]').val();
  var downloadPath = $(e.target).find('input[name="downloadpath"]').val();
  var language = $(e.target).find('input[name="language"]').val();

  settings.set('download', {
    enableDownloadStartEnd: enableDownloadStartEnd,
    skipAttachments: skipAttachments,
    skipSubtitles: skipSubtitles,
    downloadStart: parseInt(downloadStart),
    downloadEnd: parseInt(downloadEnd),
    videoQuality: videoQuality,
    path: downloadPath
  });

  settings.set('general',{
    language: language
  });

 prompt.alert(translate('Settings Saved'));

});

var settingsForm = $('.ui.settings .form');

function loadSettings(){
  var settingsCached = settings.getAll();
  if(settingsCached.download.enableDownloadStartEnd){
  settingsForm.find('input[name="enabledownloadstartend"]').prop('checked', true);
  }else{
  settingsForm.find('input[name="enabledownloadstartend"]').prop('checked', false);
  settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop('readonly',true);
  }

  if(settingsCached.download.skipAttachments){
  settingsForm.find('input[name="skipattachments"]').prop('checked', true);
  }else{
  settingsForm.find('input[name="skipattachments"]').prop('checked', false);
  }

  if(settingsCached.download.skipSubtitles){
  settingsForm.find('input[name="skipsubtitles"]').prop('checked', true);
  }else{
  settingsForm.find('input[name="skipsubtitles"]').prop('checked', false);
  }

  settingsForm.find('input[name="downloadpath"]').val(settingsCached.download.path || homedir+'/Downloads');
  settingsForm.find('input[name="downloadstart"]').val(settingsCached.download.downloadStart);
  settingsForm.find('input[name="downloadend"]').val(settingsCached.download.downloadEnd);
  var videoQuality = settings.get('download.videoQuality');
  settingsForm.find('input[name="videoquality"]').val(videoQuality);
  settingsForm.find('input[name="videoquality"]').parent('.dropdown').find('.default.text').html(videoQuality || translate('Auto'));
  var language = settingsCached.general.language;
  settingsForm.find('input[name="language"]').val(language);
  settingsForm.find('input[name="language"]').parent('.dropdown').find('.default.text').html(language || 'English');
}

settingsForm.find('input[name="enabledownloadstartend"]').change(function() {
   if(this.checked) {
    settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop('readonly',false);
   }else{
    settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop('readonly',true);
   }
});

function selectDownloadPath () {
  dialog.showOpenDialog({properties: ['openDirectory']},function (path) {
    if(path){
      fs.access(path[0], fs.R_OK&&fs.W_OK, function(err) {
          if(err){
            prompt.alert(translate('Cannot select this folder'));
          }else{
            settingsForm.find('input[name="downloadpath"]').val(path[0]);
          }
        });
    }
  });
}


function handleResponse(response,header,keyword='') {
    $(".ui.dashboard .courses.dimmer").removeClass('active');
    $('.ui.dashboard .ui.courses.section .disposable').remove();
    $('.ui.dashboard .ui.courses.section .ui.courses.items').empty();
    if(response.results.length){
       $.each(response.results,function(index,course){
          $('.ui.dashboard .ui.courses.section .ui.courses.items').append(`
                  <div class="ui course item" course-id="${course.id}" course-url="${course.url}">
                  <div class="ui tiny label download-quality grey"></div>
                  <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                    <div class="ui tiny image">
                      <img src="${course.image_240x135}">
                    </div>
                    <div class="content">
                      <span class="coursename">${course.title}</span>

                    <div class="ui tiny icon green download-success message">
                           <i class="check icon"></i>
                            <div class="content">
                              <div class="header">
                                 ${translate("Download Completed")}
                               </div>
                               <p>${translate("Click to dismiss")}</p>
                             </div>
                      </div>

                    <div class="ui tiny icon  red download-error message">
                           <i class="power icon"></i>
                            <div class="content">
                              <div class="header">
                                 ${translate("Download Failed")}
                               </div>
                               <p>${translate("Click to retry")}</p>
                             </div>
                      </div>

                      <div class="extra download-status">
                        ${downloadTemplate}
                      </div>

                    </div>
                  </div>
          `);
       });
      if(response.next){
        $('.ui.courses.section').append('<button class="ui basic blue fluid load-more button disposable" data-url='+response.next+'>Load More</button>');
      }
    }else{
       $('.ui.dashboard .ui.courses.section .ui.courses.items').append(`<div class="ui yellow message disposable">${translate("No Courses Found")}</div>`)
    }
}


function saveDownloads(){
    var downloadedCourses = [];
    $('.ui.downloads.section .ui.courses.items .ui.course.item').each(function(index,elem){
      $elem = $(elem);
       if($elem.find('.progress.active').length){
          var individualProgress = $elem.find('.download-status .individual.progress').attr('data-percent');
          var combinedProgress = $elem.find('.download-status .combined.progress').attr('data-percent');
          var completed = false;
        }else{
          var individualProgress = 0;
          var combinedProgress = 0;
          var completed = true;
        }
      var course = {
        id: $elem.attr('course-id'),
        url: $elem.attr('course-url'),
        title: $elem.find('.coursename').text(),
        image: $elem.find('.image img').attr('src'),
        individualProgress: individualProgress,
        combinedProgress: combinedProgress,
        completed: completed,
        progressStatus: $elem.find('.download-status .label').text() 
      }
      downloadedCourses.push(course);
    });
    settings.set('downloadedCourses', downloadedCourses);
}

function loadDownloads(){
  settings.get('downloadedCourses').forEach(function(course){
  $course = $(`<div class="ui course item" course-id="${course.id}" course-url="${course.url}">
                  <div class="ui tiny label download-quality grey"></div>
                  <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                    <div class="ui tiny image">
                      <img src="${course.image}">
                    </div>
                    <div class="content">
                      <span class="coursename">${course.title}</span>

                    <div class="ui tiny icon green download-success message">
                           <i class="check icon"></i>
                            <div class="content">
                              <div class="header">
                                 ${translate("Download Completed")}
                               </div>
                               <p>${translate("Click to dismiss")}</p>
                             </div>
                      </div>

                    <div class="ui tiny icon  red download-error message">
                           <i class="power icon"></i>
                            <div class="content">
                              <div class="header">
                                 ${translate("Download Failed")}
                               </div>
                               <p>${translate("Click to retry")}</p>
                             </div>
                      </div>

                      <div class="extra download-status">
                        ${downloadTemplate}
                      </div>

                    </div>
                  </div>
          `);
      $('.ui.downloads.section .ui.courses.items').append($course);
      if(!course.completed){
        $course.find('.individual.progress').progress({
          percent: course.individualProgress
        }).show();
         $course.find('.combined.progress').progress({
          percent: course.combinedProgress
        }).show();
        $course.find('.download-status .label').html(course.progressStatus);
        $course.css('padding-bottom','25px');
      }
  });
}

loadDownloads();