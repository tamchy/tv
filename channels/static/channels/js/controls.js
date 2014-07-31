TorrentStream.Controls = function(container, conf)
{
    var undefined,
    _browser,
    $ = TorrentStream.jQuery,
    
    _message = {
        current: "",
        timer: null,
        waiting: null
    },
    
    _player,
    _showBigPlayButton = true,
    _forceAutoplay = false,
    
    _lang = {
        playlist: "Playlist",
        save: "Save",
        download: "Download",
        waitStart: "Starting download...",
        playingStopped: "Playback stopped",
        downloadingStopped: "Playback stopped",
        volumeOn: "Unmute",
        volumeOff: "Mute",
        fullscreen: "Fullscreen",
        stopDownload: "Stop downloading",
        changeVolume: "Change volume",
        nextSubtitle: "Next subtitle",
        prevSubtitle: "Previous subtitle",
        nextAudioTrack: "Next audio track",
        prevAudioTrack: "Previous audio track",
        play: "Play",
        pause: "Pause",
        next: "Next",
        stop: "Stop",
        menu: "Menu",
        menuVideo: "Video",
        menuAudio: "Audio",
        menuSocial: "Social",
        menuInfo: "Info",
        format: "Choose a format",
        squeeze: "Small player",
        expand: "Large player",
        volumeUp: "Volume +",
        volumeDown: "Volume -",
        subtitle: "Subtitles",
        aspectRatio: "Aspect ratio",
        crop: "Crop",
        audioTrack: "Audio track",
        audioChannel: "Audio channel",
        unselectAll: "Unselect all",
        selectAll: "Select all",
        playlistPrev: "Previous",
        playlistNext: "Next",
        name: "Name",
        formatName: "Formats",
        formatList: "List of formats",
        embedCode: "Embed code",
        strDefault: "Default",
        stereo: "Stereo",
        reverseStereo: "Reverse stereo",
        left: "Left",
        right: "Right",
        dolby: "Dolby",
        playingAds: "Video playback will start soon",
        cannotPauseOnBuffering: "Cannot pause, wait until buffering finishes",
        noVideoFiles: "No video files",
        cannotLoadPlaylist: "Cannot get list of files. Please close plugin in the system tray and reload this page.",
        noNextItem: "No next item",
        noPrevItem: "No previous item",
        audioChannel_default: "Default",
        audioChannel_stereo: "Stereo",
        audioChannel_reverseStereo: "Reverse stereo",
        audioChannel_left: "Left",
        audioChannel_right: "Right",
        audioChannel_dolby: "Dolby",
        videoAspectRatio_default: "Default",
        videoCrop_default: "Default",
        notAvailable: "Not available",
        off: "Off",
        share: "Share",
        actions: "Actions",
        title: "Title",
        embedLink: "Player link",
        contentId: "Content ID",
        msgChecking: "Checking {progress}%",
        msgPrebuffering: "Prebuffering {progress}% (connected to {peer_count} peers)",
        msgWaiting: "Playback will start in: {time}. You can disable the option of waiting and start watching with interruptions",
        msgBuffering: "Buffering {progress}% (connected to {peer_count} peers)"
    },
    
    _self = this,
    _contextDocument,
    _location,
    _uniqueId,
    
    _timers = {
        iframeChild: null
    },
    
    _minWidth = 450,
    _minHeight = 280,
    _menuRightWidth = 270,
    _defaultMenuRightWidth = 270,
    _contentPreviewRect = {
        width: 188,
        height: 106,
        top: 80
    },
    
    _draggingProgress = false,
    _dragStartPosition = 0,
    
    _containerWidth = 0,
    _containerHeight = 0,
    _pluginWidth = 0,
    _pluginHeight = 0,
    _menuVisible = false,
    _infowindowVisible = false,
    
    _playlistInfo = {
        visible: false,
        totalPages: 0,
        currentPage: 0,
        pageHeight: 0
    },
    _embedInfo = {
        width: 300,
        height: 150
    };
    
    function _log(msg) {
        if(!conf.debug) {
            return;
        }
        
        try {
            if(!msg) {
                msg = "";
            }
            msg = "Controls::" + msg;
            console.log(msg);
        }
        catch(e) {}
    }
    
    function makeId() {
        return "ts" + ("" + Math.random()).substring(2, 10);
    }
    
    function press_and_hold(btn, action) {
        var t, i = 0, start = 750, step = 10, speedup = 1.3, speed = 100;
        
        var repeat = function () {
            action();
            t = setTimeout(repeat, (i == 0 ? start : speed));
            ++i;
            if(i % step == 0) {
                speed /= speedup;
            }
        }
        
        btn.mousedown(function() {
                i = 0;
                speed = 100;
                repeat();
        });
        
        btn.mouseup(function () {
                clearTimeout(t);
        });
        
        btn.mouseleave(function() {
                $(this).mouseup();
        });
    };
    
    function fixIE() {
        var $controls = $("#" + _self.id("controls")),
            $progressBox = $controls.find(".ts-progress-box"),
            $durationContainer = $progressBox.find(".ts-duration-container"),
            $statusWrap = $controls.find(".ts-status-wrap"),
            $progressWrap = $controls.find(".ts-progress-wrap");
            
        var controlsWidth = $controls.width(),
            progressBoxWidth = controlsWidth - 189 - 93,
            durationContainerWidth = progressBoxWidth - 127 - 9,
            statusWrapWidth = progressBoxWidth - 65 - 10,
            progressWrapWidth = progressBoxWidth - 6 - 5;
            
        $progressBox.css("width", progressBoxWidth + "px");
        $durationContainer.css("width", durationContainerWidth + "px");
        $statusWrap.css("width", statusWrapWidth + "px");
        $progressWrap.css("width", progressWrapWidth + "px");
        
        $("#" + _self.id("duration")).css("height", "17px");
    }
    
    function fixIEplaylist() {
        var $playlistBox = $("#" + _self.id("playlist-box")),
            playlistBoxWidth = $playlistBox.width(),
            playlistItemNameWidth = playlistBoxWidth - 32 - 48;
        
        $playlistBox.find(".ts-name").css("width", playlistItemNameWidth + "px");
    }
    
    function ytSetCurrentFormat(format, quality) {
        TorrentStream.Utils.setCookie("p2pyoutube_current_format", format + "," + quality, {
                expires: 2592000
        });
    }
    
    function onresize(force, containerWidth, containerHeight)
    {
        if(conf.style == "ts-white-screen") {
            // constant size - do nothing
            return;
        }
        if(conf.style == "internal") {
            return;
        }
        
        var sizeChanged;
        
        if(!containerWidth) {
            containerWidth = $("#"+_self.id(), _contextDocument).width();
        }
        if(!containerHeight) {
            containerHeight = $("#"+_self.id(), _contextDocument).height();
        }
        
        _log("onresize: _containerWidth=" + _containerWidth + " containerWidth=" + containerWidth);
        
        // check if size changed
        sizeChanged = false;
        if(_containerWidth != containerWidth) {
            _containerWidth = containerWidth;
            sizeChanged = true;
        }
        if(_containerHeight != containerHeight) {
            _containerHeight = containerHeight;
            sizeChanged = true;
        }
        
        if(!sizeChanged && !force) {
            return;
        }
        
        _log("onresize(): _self.id=" + _self.id() + " containerWidth=" + containerWidth + " containerHeight=" + containerHeight);
        
        var controlsHeight = 33;
        if(containerWidth < _minWidth) {
            containerWidth = _minWidth;
        }
        
        if(containerHeight < _minHeight) {
            containerHeight = _minHeight;
        }
        
        if(_infowindowVisible) {
            controlsHeight = 0;
        }
        
        _pluginWidth = containerWidth;
        _pluginHeight = containerHeight - controlsHeight;
        
        _log("onresize: controlsHeight=" + controlsHeight);
        
        $("#" + _self.id("big-play-button"), _contextDocument).css({
                "left": ((_pluginWidth - 108) / 2) + "px",
                "top": ((_pluginHeight - 108) / 2) + "px"
        });
        $("#"+_self.id("wait-speed")).css("height", _pluginHeight + "px");
        
        if(_pluginWidth >= 650) {
            _menuRightWidth = _defaultMenuRightWidth;
            $("#" + _self.id("menu-right"), _contextDocument).show();
            $("#" + _self.id("playlist-right"), _contextDocument).show();
        }
        else {
            _menuRightWidth = 0;
            $("#" + _self.id("menu-right"), _contextDocument).hide();
            $("#" + _self.id("playlist-right"), _contextDocument).hide();
        }
        
        if(_menuVisible || _playlistInfo.visible) {
            if(_menuRightWidth == 0) {
                //$("#" + _self.id("content"), _contextDocument).css("left", "9999px");
                hidePlugin();
            }
            else {
                $("#" + _self.id("content"), _contextDocument).css({width: "188px", height: "106px", left: "auto", right: ((_menuRightWidth - 188) / 2) + "px", top: "80px"});
            }
        }
        else if(_infowindowVisible) {
            // do nothing, content should remain unvisible
        }
        else {
            $("#"+_self.id("content"), _contextDocument).css({
                    width:  _pluginWidth + "px",
                    height: _pluginHeight + "px"
            });
        }
        
        $("#"+_self.id("infowindow"), _contextDocument).css("height", _pluginHeight + "px");
        $("#"+_self.id("infowindow") + " iframe", _contextDocument).css("height", _pluginHeight + "px");
        
        $("#"+_self.id("menu-box"), _contextDocument).css("height", _pluginHeight + "px");
        $("#"+_self.id("menu-left"), _contextDocument).css({
                "width": (_pluginWidth - _menuRightWidth - 1) + "px",
                "height": (_pluginHeight - 27) + "px"
        });
        $("#"+_self.id("menu-right"), _contextDocument).css("height", (_pluginHeight - 27) + "px");
        
        if(conf.youtube) {
            $("#"+_self.id("playlist-container"), _contextDocument).css("height", _pluginHeight + "px");
            $("#"+_self.id("playlist-left"), _contextDocument).css({
                    "height": (_pluginHeight - 59) + "px",
                    "width": (_pluginWidth - _menuRightWidth) + "px"
            });
            $("#"+_self.id("playlist-right"), _contextDocument).css({
                    "height": (_pluginHeight - 27) + "px"
            });
            $("#"+_self.id("playlist-box"), _contextDocument).css({
                    "width": (_pluginWidth - _menuRightWidth) + "px",
                    "height": (_pluginHeight - 59) + "px"
            });
        }
        else {
            $("#"+_self.id("playlist-container"), _contextDocument).css("height", _pluginHeight + "px");
            $("#"+_self.id("playlist-left"), _contextDocument).css({
                    "height": (_pluginHeight - 59) + "px",
                    "width": (_pluginWidth - _menuRightWidth) + "px"
            });
            $("#"+_self.id("playlist-right"), _contextDocument).css({
                    "height": (_pluginHeight - 59) + "px"
            });
            $("#"+_self.id("playlist-box"), _contextDocument).css({
                    "width": (_pluginWidth - _menuRightWidth) + "px",
                    "height": (_pluginHeight - 90) + "px"
            });
        }
        $("#"+_self.id("playlist-box") + " .jspContainer", _contextDocument).css("width", (_pluginWidth - _menuRightWidth) + "px");
        $("#"+_self.id("playlist-box") + " .jspPane", _contextDocument).css("width", (_pluginWidth - _menuRightWidth) + "px");
        
        if(_playlistInfo.visible) {
            $("#"+_self.id("playlist-box") + " ." + _self.id("name"), _contextDocument).scrollText({
                    marginLeft: 0,
                    marginRight: 16
            });
            initPlaylistPages();
        }
        
        $("#" + _self.id("yt-formats-list")).css("top", _containerHeight + "px");
        
        if(_browser.name == "ie") {
            fixIE();
        }
    }
    
    function showMsg(msg, delay)
    {
        delay = delay || 0;
        
        if(delay == 0) {
            if(_message.timer) {
                _message.waiting = msg;
            }
            else {
                displayMsg(msg);
            }
        }
        else {
            // delayed message
            if(_message.timer && _message.timer != -1) {
                clearTimeout(_message.timer);
            }
            else if(!_message.timer) {
                if(_message.waiting === null) {
                    _message.waiting = _message.current;
                }
            }
            
            if(delay === -1) {
                _message.timer = -1;
            }
            else {
                _message.timer = setTimeout(restoreMsg, delay);
            }
            
            displayMsg(msg);
        }
    }
    
    function restoreMsg()
    {
        var msg = _message.waiting || "";
        _message.waiting = null;
        _message.timer = null;
        displayMsg(msg);
    }
    
    function displayMsg(msg)
    {
        //_log("displayMsg: " + msg);
        if(msg != _message.current) {
            // text changed: reinitialize scroller and start
            _message.current = msg;
            $("#"+_self.id("status"), _contextDocument).html(msg);
            $("#"+_self.id("status-wrap"), _contextDocument).scrollText({interval: 50}).scrollText("start").hover(
                function() {
                    $(this).scrollText("stop");
                },
                function() {
                    $(this).scrollText("start");
                }
                );
        }
    }
    
    function showInfowindow(visible, contents)
    {
        if(contents) {
            $("#" + _self.id("infowindow"), _contextDocument).html(contents);
        }
        
        if(_player) {
            if(visible) {
                _player.pause(true);
            }
            else {
                _player.pause(false);
            }
        }
        
        _infowindowVisible = visible;
        if(_player) {
            _player.blocked(visible);
        }
        
        if(visible) {
            $("#" + _self.id("content"), _contextDocument).css({'width': '2px', 'height': '2px', 'left': (_pluginWidth + "px")});
            $("#" + _self.id("infowindow"), _contextDocument).show();
            $("#" + _self.id("controls"), _contextDocument).hide();
            onresize(true);
            _timers.iframeChild = setInterval(iframe_child_listener, 100);
        }
        else {
            clearInterval(_timers.iframeChild);
            _timers.iframeChild = null;
            $("#" + _self.id("infowindow"), _contextDocument).hide();
            $("#" + _self.id("controls"), _contextDocument).show();
            onresize(true);
            
            var w, h;
            w = _pluginWidth + 'px';
            h = _pluginHeight + 'px';
            $("#" + _self.id("content"), _contextDocument).css({'width': w, 'height': h, 'left': '0'});
        }
    }
    
    function gotIframeMessage(msg)
    {
        _log("gotIframeMessage: msg=" + msg);
        
        if(msg === "close") {
            showInfowindow(false);
        }
        else if(msg === "ca") {
            var authLevel = 0;
            if(_player) {
                authLevel = _player.getAuthLevel();
            }
            $("#" + _self.id("iframe"), _contextDocument).attr("src", $("#" + _self.id("iframe"), _contextDocument).data("src") + "#al" + authLevel);
        }
        else if(msg === "scsn104") {
            TorrentStream.Utils.setCookie("__ts_sn104", 1, {expires: 311040000, path: "/"});
        }
        else if(msg === "dcsn104") {
            TorrentStream.Utils.deleteCookie("__ts_sn104");
        }
    }
    
    function iframe_child_listener()
    {
        if(!_contextDocument || !_contextDocument.defaultView) {
            return;
        }
        
        var hash = _location.hash;
        if(hash == "#tsclose") {
            _location.hash = "#ts";
            gotIframeMessage("close");
        }
        else if(hash == "#tsca") {
            _location.hash = "#ts";
            gotIframeMessage("ca");
        }
        else if(hash == "#tsscsn104") {
            _location.hash = "#ts";
            gotIframeMessage("scsn104");
        }
        else if(hash == "#tsdcsn104") {
            _location.hash = "#ts";
            gotIframeMessage("dcsn104");
        }
    }
    
    function showIframeMessage(reason)
    {
        _log("showIframeMessage(reason=" + reason + ")");
        
        var reasonCode;
        if(reason == "plugin_not_installed") {
            reasonCode = 1;
        }
        else if(reason == "need_auth_playlist") {
            reasonCode = 2;
        }
        else if(reason == "need_auth_seek") {
            reasonCode = 3;
        }
        else if(reason == "old_version_no_crop") {
            reasonCode = 4;
        }
        else if(reason == "old_version_1_0_2") {
            reasonCode = 5;
        }
        else if(reason == "notify_version_1_0_4") {
            reasonCode = 6;
        }
        else if(reason == "notify_version_1_0_5") {
            reasonCode = 7;
        }
        else {
            _log("showIframeMessage: unknown reason: " + reason);
            return;
        }
        
        if(_showBigPlayButton) {
            $("#" + _self.id("big-play-button"), _contextDocument).hide();
        }
        
        if(_menuVisible) {
            showMenu(false);
        }
        if(_playlistInfo.visible) {
            showPlaylist(false);
        }
        _infowindowVisible = true;
        onresize(true);
        
        var h = 0;
        if(_pluginHeight) {
            h = _pluginHeight;
        }
        else {
            h = $(container, _contextDocument).height();
        }
        
        if(!h) {
            h = 200;
        }
        
        _log("showIframeMessage: height=" + h);
        
        var oldversion = 0;
        var affiliateId = _player ? _player.getAffiliateId() : 0;
        var playerId = _player ? _player.getPlayerId() : '';
        var src = 'http://torrentstream.org/ext/index.php?s=' + conf.style + '&v=' + oldversion + '&a=' + affiliateId + '&pid=' + playerId + '&r=' + reasonCode + '&l=' + conf.langId + '&ic=' + conf.iframeCommunication + '&p=' + TorrentStream.Utils.urlEncode(_location.href);
        
        var bgColor;
        if(conf.style == "ts-white-screen" || conf.style == "ts-white") {
            bgColor = "#708290";
        }
        else {
            bgColor = "#121415";
        }
        $iframe = $('<iframe id="' + _self.id("iframe") + '" style="width: 100%; height: ' + h + 'px; border: none; background-color: ' + bgColor + ';" frameborder="0" src=""></iframe>', _contextDocument);
        $iframe.attr("src", src).data("src", src);
        showInfowindow(true, $iframe);
    }
    
    function showMenu(visible) {
        
        if(_playlistInfo.visible) {
            showPlaylist(false);
        }
        
        _menuVisible = visible;
        if(visible) {
            if(_showBigPlayButton) {
                $("#" + _self.id("big-play-button"), _contextDocument).hide();
            }
            
            // check whether we have player id
            var playerId,
                playerEmbedLink,
                playerEmbedTitle = "Torrent Stream Player";
                
            if(_player) {
                playerId = _player.getPlayerId();
            }
            
            if( ! playerId) {
                $("." + _self.id("menu-switch") + "[rel=social]", _contextDocument).hide();
                $("." + _self.id("menu-page") + "[rel=social]", _contextDocument).hide();
            }
            else {
                playerEmbedLink = "http://torrentstream.org/play.php?id=" + playerId;
                $("." + _self.id("menu-switch") + "[rel=social]", _contextDocument).show();
                
                $("#" + _self.id("player-embed-link"), _contextDocument).val(playerEmbedLink);
                $("#" + _self.id("player-embed-id"), _contextDocument).val(playerId);
                
                $("#" + _self.id("share-link-fb"), _contextDocument).attr("href", "http://www.facebook.com/sharer.php?u=" + TorrentStream.Utils.urlEncode(playerEmbedLink) + "&t=" + TorrentStream.Utils.urlEncode(playerEmbedTitle));
                $("#" + _self.id("share-link-vk"), _contextDocument).attr("href", "http://vkontakte.ru/share.php?url=" + TorrentStream.Utils.urlEncode(playerEmbedLink));
                $("#" + _self.id("share-link-twitter"), _contextDocument).attr("href", "http://twitter.com/share?url=" + TorrentStream.Utils.urlEncode(playerEmbedLink) + "&text=" + TorrentStream.Utils.urlEncode(playerEmbedTitle));
                $("#" + _self.id("share-link-buzz"), _contextDocument).attr("href", "http://www.google.com/buzz/post?url=" + TorrentStream.Utils.urlEncode(playerEmbedLink));
                $("#" + _self.id("share-link-odnoklassniki"), _contextDocument).attr("href", "http://www.odnoklassniki.ru/dk?st.cmd=addShare&st._surl=" + TorrentStream.Utils.urlEncode(playerEmbedLink));
                $("#" + _self.id("share-link-myspace"), _contextDocument).attr("href", "http://www.myspace.com/index.cfm?fuseaction=postto&t=" + TorrentStream.Utils.urlEncode(playerEmbedTitle) + "&u=" + TorrentStream.Utils.urlEncode(playerEmbedLink));
                $("#" + _self.id("share-link-lj"), _contextDocument).attr("href", "http://www.livejournal.com/update.bml?event=" + TorrentStream.Utils.urlEncode(playerEmbedLink) + "&subject=" + TorrentStream.Utils.urlEncode(playerEmbedTitle));
                $("#" + _self.id("share-link-mailru"), _contextDocument).attr("href", "http://connect.mail.ru/share?url=" + TorrentStream.Utils.urlEncode(playerEmbedLink) + "&title=" + TorrentStream.Utils.urlEncode(playerEmbedTitle));
                $("#" + _self.id("share-link-blogger"), _contextDocument).attr("href", "http://www.blogger.com/blog_this.pyra?t=" + TorrentStream.Utils.urlEncode(playerEmbedLink) + "&u=" + TorrentStream.Utils.urlEncode(playerEmbedLink) + "&n=" + TorrentStream.Utils.urlEncode(playerEmbedTitle));
                
                updateEmbedCode();
            }
            
            $("#" + _self.id("menu-box"), _contextDocument).show();
            if(_pluginWidth >= 650 || conf.style == "ts-white-screen") {
                $("#" + _self.id("content"), _contextDocument).css({
                    width: _contentPreviewRect.width + "px",
                    height: _contentPreviewRect.height + "px",
                    left: "auto",
                    right: ((_menuRightWidth - _contentPreviewRect.width) / 2) + "px",
                    top: _contentPreviewRect.top + "px"
                });
            }
            else {
                $("#" + _self.id("content"), _contextDocument).css("left", "9999px");
            }
        }
        else {
            $("#" + _self.id("menu-box"), _contextDocument).hide();
            $("#" + _self.id("content"), _contextDocument).css({width: _pluginWidth + "px", height: _pluginHeight + "px", left: "0px", right: "auto", top: "0px"});
        }
    }
    
    function showMenuPage(page)
    {
        _log("showMenuPage: page=" + page);
        $("." + _self.id("menu-page") + "[rel!=" + page + "]", _contextDocument).hide();
        $("." + _self.id("menu-page") + "[rel=" + page + "]", _contextDocument).show();
        
        if(conf.style == "ts-white-screen") {
            var bpActive = "",
                bpNotActive = "",
                backgroundPositions = {
                home: {
                    active: "-36px -260px",
                    notActive: "0px -259px"
                },
                video: {
                    active: "-108px -260px",
                    notActive: "-72px -259px"
                },
                audio: {
                    active: "-180px -260px",
                    notActive: "-144px -259px"
                },
                social: {
                    active: "-252px -260px",
                    notActive: "-216px -259px"
                }
            };
            $("." + _self.id("menu-icon") + ".active", _contextDocument).each(
                function() {
                    $(this).removeClass("active").css("background-position", backgroundPositions[$(this).attr("rel")].notActive);
                });
            $("." + _self.id("menu-icon") + "[rel=" + page + "]", _contextDocument).addClass("active").css("background-position", backgroundPositions[page].active);
        }
        else {
            $("#" + _self.id("menu-icon-selected"), _contextDocument).css({"left": $("." + _self.id("menu-icon") + "[rel=" + page + "]", _contextDocument).css("left")});
        }
    }
    
    function getAuthLevel() {
        return _player ? _player.getAuthLevel() : 0;
    }
    
    function showPlugin() {
        $("#" + _self.id("content"), _contextDocument).css({
            width: _pluginWidth + "px",
            height: _pluginHeight + "px",
            left: "0px",
            right: "auto",
            top: "0px"
        });
    }
    
    function hidePlugin() {
        if(conf.youtube) {
            $("#" + _self.id("content"), _contextDocument).css({
                    left: "0px",
                    top: "0px",
                    width: "1px",
                    height: "1px"
            });
        }
        else {
            $("#" + _self.id("content"), _contextDocument).css("left", "9999px");
        }
    }
    
    function showPlaylist(visible) {
        
        if(_menuVisible) {
            showMenu(false);
        }
        
        if(!conf.youtube && visible && getAuthLevel() == 0) {
            _self.onSystemMessage("need_auth_playlist");
            return;
        }
        
        _playlistInfo.visible = visible;
        if(visible) {
            
            if(_showBigPlayButton) {
                $("#" + _self.id("big-play-button"), _contextDocument).hide();
            }
            $("#" + _self.id("playlist-container"), _contextDocument).show();
            
            if(_pluginWidth >= 650 || conf.style == "ts-white-screen") {
                $("#" + _self.id("content"), _contextDocument).css({
                    width: _contentPreviewRect.width + "px",
                    height: _contentPreviewRect.height + "px",
                    left: "auto",
                    right: ((_menuRightWidth - _contentPreviewRect.width) / 2) + "px",
                    top: _contentPreviewRect.top + "px"
                });
            }
            else {
                hidePlugin();
            }
            
            if(!conf.youtube) {
                syncPlaylist();
            }
            var jsp = $("#" + _self.id("playlist-box"), _contextDocument).data("jsp");
            if(jsp) {
                jsp.reinitialise();
            }
            $("#"+_self.id("playlist-box") + " ." + _self.id("name"), _contextDocument).scrollText({
                    marginLeft: 0,
                    marginRight: 16
            });
            
            if(!conf.youtube) {
                initPlaylistPages();
            }
        }
        else {
            $("#" + _self.id("playlist-container"), _contextDocument).hide();
            showPlugin();
        }
    }
    
    function setControlOptions(controls, options)
    {
        $("#" + _self.id("menu-options-" + controls), _contextDocument).html("");
        
        if(options.length == 0) {
            $("." + _self.id("menu-dd-open") + "[rel=\"" + controls + "\"]", _contextDocument).hide();
            return;
        }
        
        $("." + _self.id("menu-dd-open") + "[rel=" + controls + "]", _contextDocument).show();
        
        var prefix = null;
        if(controls == "video-aspect-ratio") {
            prefix = "videoAspectRatio_";
        }
        else if(controls == "video-crop") {
            prefix = "videoCrop_";
        }
        else if(controls == "audio-channel") {
            prefix = "audioChannel_";
        }
        
        var name;
        for(var i = 0; i < options.length; i++) {
            name = options[i];
            if(prefix && _lang[prefix + name] !== undefined) {
                name = _lang[prefix + name];
            }
            $("#" + _self.id("menu-options-" + controls), _contextDocument).append('<li value="' + i + '" style="display: inline-block; padding: 0; margin: 3px 0 0 5px; cursor: pointer;">' + name + '</li><br/>');
        }
        
        $("#" + _self.id("menu-options-" + controls + " li"), _contextDocument).click(function() {
                var controls = $(this).parent().attr("rel"),
                    value = $(this).attr("value");
                
                if(_player) {
                    if(controls == "video-subtitle") {
                        value = _player.subtitle(value);
                        setSubtitle(value, _player.getVideoSubtitleList());
                    }
                    else if(controls == "video-aspect-ratio") {
                        value = _player.aspectRatio(value);
                        setAspectRatio(value, _player.getVideoAspectRatioList());
                    }
                    else if(controls == "video-crop") {
                        value = _player.crop(value);
                        setCrop(value, _player.getVideoCropList());
                    }
                    else if(controls == "audio-track") {
                        value = _player.audioTrack(value);
                        setAudioTrack(value, _player.getAudioTrackList());
                    }
                    else if(controls == "audio-channel") {
                        value = _player.audioChannel(value);
                        setAudioChannel(value, _player.getAudioChannelList());
                    }
                }
                
                // close popup
                $(this).parent().parent().parent().hide();
        }).hover(
        function() {
            $(this).css({'text-decoration': 'underline'});
        },
        function() {
            $(this).css({'text-decoration': 'none'});
        }
        );
    }
    
    function createPopupPlayer()
    {
        if($("#torrentstream-body").size() != 0) {
            return;
        }
        var html;
        
        html = "<div id=\"torrentstream-body\">\n\
            <div class=\"overlay-background\"></div>\n\
            <div class=\"big-screen\">\n\
            <div class=\"page player-page torrentstream-player-page\" style=\"display: none;\">\n\
				<div class=\"tsplayer\" id=\"" + _self.id("content") + "\"></div>\n\
				<div class=\"ts-infowindow\" id=\"" + _self.id("infowindow") + "\"></div>\n\
				<div class=\"menu-box\" id=\"" + _self.id("menu-box") + "\">\n\
				    <div class=\"menu-icons\">\n\
						<div class=\"" + _self.id("menu-icon") + " " + _self.id("menu-switch") + " home active\" rel=\"home\" style=\"background-position: -36px -260px;\"></div>\n\
						<div class=\"" + _self.id("menu-icon") + " " + _self.id("menu-switch") + " video\" rel=\"video\"></div>\n\
						<div class=\"" + _self.id("menu-icon") + " " + _self.id("menu-switch") + " audio\" rel=\"audio\"></div>\n\
						<div class=\"" + _self.id("menu-icon") + " " + _self.id("menu-switch") + " social\" rel=\"social\"></div>\n\
					</div>\n\
					<div class=\"menu-white\">\n\
						<div class=\"bg-left\"></div>\n\
						<div class=\"bg-center\"><p>" + _lang.menu + "</p></div>\n\
						<div class=\"bg-right\">\n\
							<div class=\"tsplayer-border\"></div>\n\
						</div>\n\
					</div>\n\
					<div class=\"block-left\">\n\
						<div class=\"menu-page " + _self.id("menu-page") + "\" rel=\"home\" style=\"display: block;\">\n\
							<div class=\"" + _self.id("menu-switch") + " menu-btn menu-margin\" rel=\"video\">\n\
								<p>" + _lang.menuVideo + "</p>\n\
							</div>\n\
							<div class=\"" + _self.id("menu-switch") + " menu-btn\" rel=\"audio\">\n\
								<p>" + _lang.menuAudio + "</p>\n\
							</div>\n\
							<div class=\"" + _self.id("menu-switch") + " menu-btn\" rel=\"social\">\n\
								<p>" + _lang.menuSocial + "</p>\n\
							</div>\n\
						</div>\n\
						<div class=\"menu-page " + _self.id("menu-page") + "\" rel=\"video\">\n\
							<div class=\"form video-bg margin-top\">\n\
								<p>" + _lang.subtitle + "</p>\n\
								<div class=\"input-area\">\n\
									<div class=\"minus menu-switch-down\" rel=\"video-subtitle\"></div>\n\
									<span class=\"input-type-text\">\n\
										<span id=\"" + _self.id("menu-video-subtitle-value") + "\" class=\"input\"></span>\n\
										<div class=\"arrow " + _self.id("menu-dd-open") + "\" rel=\"video-subtitle\"></div>\n\
									</span>\n\
									<div class=\"plus menu-switch-up\" rel=\"video-subtitle\"></div>\n\
								</div>\n\
							</div>\n\
							<div class=\"form video-bg\">\n\
								<p>" + _lang.aspectRatio + "</p>\n\
								<div class=\"input-area\">\n\
									<div class=\"minus menu-switch-down\" rel=\"video-aspect-ratio\"></div>\n\
									<span class=\"input-type-text\">\n\
										<span id=\"" + _self.id("menu-video-aspect-ratio-value") + "\" class=\"input\"></span>\n\
										<div class=\"menu-dd-open arrow\" rel=\"video-aspect-ratio\"></div>\n\
									</span>\n\
									<div class=\"plus menu-switch-up\" rel=\"video-aspect-ratio\"></div>\n\
								</div>\n\
							</div>\n\
							<div class=\"form video-bg\">\n\
								<p>" + _lang.crop + "</p>\n\
								<div class=\"input-area\">\n\
									<div class=\"minus menu-switch-down\" rel=\"video-crop\"></div>\n\
									<span class=\"input-type-text\">\n\
										<span id=\"" + _self.id("menu-video-crop-value") + "\" class=\"input\"></span>\n\
										<div class=\"menu-dd-open arrow\" rel=\"video-crop\"></div>\n\
									</span>\n\
									<div class=\"plus menu-switch-up\" rel=\"video-crop\"></div>\n\
								</div>\n\
							</div>\n\
							<!-- popup.video.subtitle -->\n\
							<div class=\"menu-popup-video-subtitle menu-popup-wrap\">\n\
								<div class=\"menu-popup-mask\"></div>\n\
								<div class=\"menu-popup-window\">\n\
									<div class=\"menu-popup-close\"></div>\n\
									<ul id=\"" + _self.id("menu-options-video-subtitle") + "\" class=\"menu-popup-values\" rel=\"video-subtitle\"></ul>\n\
								</div>\n\
							</div>\n\
							<!-- popup.video.aspectRatio -->\n\
							<div class=\"menu-popup-video-aspect-ratio menu-popup-wrap\">\n\
								<div class=\"menu-popup-mask\"></div>\n\
								<div class=\"menu-popup-window\">\n\
									<div class=\"menu-popup-close\"></div>\n\
									<ul id=\"" + _self.id("menu-options-video-aspect-ratio") + "\" class=\"menu-popup-values\" rel=\"video-aspect-ratio\"></ul>\n\
								</div>\n\
							</div>\n\
							<!-- popup.video.crop -->\n\
							<div class=\"menu-popup-video-crop menu-popup-wrap\">\n\
								<div class=\"menu-popup-mask\"></div>\n\
								<div class=\"menu-popup-window\">\n\
									<div class=\"menu-popup-close\"></div>\n\
									<ul id=\"" + _self.id("menu-options-video-crop") + "\" class=\"menu-popup-values\" rel=\"video-crop\"></ul>\n\
								</div>\n\
							</div>\n\
						</div>\n\
						<!-- AUDIO -->\n\
						<div class=\"menu-page " + _self.id("menu-page") + "\" rel=\"audio\">\n\
							<div class=\"form video-bg margin-top\">\n\
								<p>" + _lang.audioTrack + "</p>\n\
								<div class=\"input-area\">\n\
									<div class=\"minus menu-switch-down\" rel=\"audio-track\"></div>\n\
									<span class=\"input-type-text\">\n\
										<span id=\"" + _self.id("menu-audio-track-value") + "\" class=\"input\"></span>\n\
										<div class=\"menu-dd-open arrow\" rel=\"audio-track\"></div>\n\
									</span>\n\
									<div class=\"plus menu-switch-up\" rel=\"audio-track\"></div>\n\
								</div>\n\
							</div>\n\
							<div class=\"form video-bg\">\n\
								<p>" + _lang.audioChannel + "</p>\n\
								<div class=\"input-area\">\n\
									<div class=\"minus menu-switch-down\" rel=\"audio-channel\"></div>\n\
									<span class=\"input-type-text\">\n\
										<span id=\"" + _self.id("menu-audio-channel-value") + "\" class=\"input\"></span>\n\
										<div class=\"menu-dd-open arrow\" rel=\"audio-channel\"></div>\n\
									</span>\n\
									<div class=\"plus menu-switch-up\" rel=\"audio-channel\"></div>\n\
								</div>\n\
							</div>\n\
							<!-- popup.audio.track -->\n\
							<div class=\"menu-popup-audio-track menu-popup-wrap\">\n\
								<div class=\"menu-popup-mask\"></div>\n\
								<div class=\"menu-popup-window\">\n\
									<div class=\"menu-popup-close\"></div>\n\
									<ul id=\"" + _self.id("menu-options-audio-track") + "\" class=\"menu-popup-values\" rel=\"audio-track\"></ul>\n\
								</div>\n\
							</div>\n\
							<!-- popup.audio.channel -->\n\
							<div class=\"menu-popup-audio-channel menu-popup-wrap\">\n\
								<div class=\"menu-popup-mask\"></div>\n\
								<div class=\"menu-popup-window\">\n\
									<div class=\"menu-popup-close\"></div>\n\
									<ul id=\"" + _self.id("menu-options-audio-channel") + "\" class=\"menu-popup-values\" rel=\"audio-channel\"></ul>\n\
								</div>\n\
							</div>\n\
						</div>\n\
						<!-- SOCIAL -->\n\
						<div class=\"menu-page " + _self.id("menu-page") + "\" rel=\"social\">\n\
							<p class=\"share\">" + _lang.share + "</p>\n\
							<div class=\"social-icons\">\n\
								<a id=\"" + _self.id("share-link-fb") + "\" href=\"#\" target=\"_blank\"><div class=\"links facebook\"></div></a>\n\
								<a id=\"" + _self.id("share-link-vk") + "\" href=\"#\" target=\"_blank\"><div class=\"links vkontakte\"></div></a>\n\
								<a id=\"" + _self.id("share-link-twitter") + "\" href=\"#\" target=\"_blank\"><div class=\"links twitter\"></div></a>\n\
								<a id=\"" + _self.id("share-link-buzz") + "\" href=\"#\" target=\"_blank\"><div class=\"links buzz\"></div></a>\n\
								<a id=\"" + _self.id("share-link-odnoklassniki") + "\" href=\"#\" target=\"_blank\"><div class=\"links odnoklassniki\"></div></a>\n\
								<a id=\"" + _self.id("share-link-myspace") + "\" href=\"#\" target=\"_blank\"><div class=\"links myspace\"></div></a>\n\
								<a id=\"" + _self.id("share-link-lj") + "\" href=\"#\" target=\"_blank\"><div class=\"links lifejournal\"></div></a>\n\
							</div>\n\
							<div class=\"menu-link\">\n\
								<div class=\"form color-bg\">\n\
									<span>" + _lang.embedLink + "</span>\n\
									<input class=\"simple-required\" id=\"" + _self.id("player-embed-link") + "\" type=\"text\" readonly=\"readonly\" onclick=\"this.focus();this.select();\" value=\"\" style=\"width: 240px !important;\" />\n\
								</div>\n\
								<div class=\"form color-bg\">\n\
									<span>" + _lang.contentId + "</span>\n\
									<input class=\"simple-required\" id=\"" + _self.id("player-embed-id") + "\" type=\"text\" readonly=\"readonly\" onclick=\"this.focus();this.select();\" value=\"\" style=\"width: 240px !important;\" />\n\
								</div>\n\
							</div>\n\
							<div class=\"menu-link area\">\n\
								<span class=\"button show-popup-embed\">" + _lang.embedCode + "</span>\n\
							</div>\n\
						</div>\n\
						<div class=\"menu-popup-embed-code menu-popup-wrap\">\n\
							<div class=\"menu-popup-mask\"></div>\n\
							<div class=\"menu-popup-window\">\n\
								<div class=\"menu-popup-close\"></div>\n\
								<div class=\"inner-code\">\n\
									<textarea id=\"" + _self.id("player-embed-code-iframe") + "\" class=\"oneTA\" readonly=\"readonly\" onclick=\"this.focus();this.select();\" style=\"height: 140px;\"></textarea>\n\
									<div class=\"embed-container\">\n\
										<div class=\"float\">\n\
											<div class=\"text\">650x521</div>\n\
											<div class=\"" + _self.id("embed-size") + " style current\" embed-width=\"650\" embed-height=\"521\" style=\"width: 50px; height: 38px;\"></div>\n\
										</div>\n\
										<div class=\"float\">\n\
											<div class=\"text\">650x399</div>\n\
											<div class=\"" + _self.id("embed-size") + " style\" embed-width=\"650\" embed-height=\"399\" style=\"width: 50px; height: 28px;\"></div>\n\
										</div>\n\
										<div class=\"float\">\n\
											<div class=\"text\">650x439</div>\n\
											<div class=\"" + _self.id("embed-size") + " style\" embed-width=\"650\" embed-height=\"439\" style=\"width: 50px; height: 31px;\"></div>\n\
										</div>\n\
										<div class=\"float\" style=\"margin: 0;\">\n\
											<div class=\"text\">798x342</div>\n\
											<div class=\"" + _self.id("embed-size") + " style\" embed-width=\"798\" embed-height=\"342\" style=\"width: 61px; height: 26px;\"></div>\n\
										</div>\n\
									</div>\n\
								</div>\n\
							</div>\n\
						</div>\n\
					</div>\n\
					<div class=\"block-right\">\n\
						<div class=\"block-shadow\"></div>\n\
						<div class=\"tsplayer-border\"></div>\n\
					</div>\n\
				</div>\n\
				<!-- PLAYLIST -->\n\
				<div class=\"playlist-container pl-page\" id=\"" + _self.id("playlist-container") + "\">\n\
				    <div class=\"playlist-head\">\n\
						<p>" + _lang.playlist + "</p>\n\
					</div>\n\
					<div class=\"top\">\n\
						<table class=\"table\" cellspacing=\"0\" width=\"100%\">\n\
							<thead>\n\
								<tr>\n\
									<th class=\"black-cell td1\"><div class=\"loader\"></div></th>\n\
									<th scope=\"col\" class=\"ts-title\">\n\
										" + _lang.title + "\n\
									</th>\n\
									<th scope=\"col\" class=\"table-actions td3\">" + _lang.actions + "</th>\n\
									<th scope=\"col\" class=\"td4\"></th>\n\
								</tr>\n\
							</thead>\n\
						</table>\n\
					</div>\n\
					<div class=\"block-left playlist\">\n\
					        <div id=\"" + _self.id("playlist-line-left") + "\" class=\"ts-playlist-line-left\" style=\"height: 0px;\"></div>\n\
					        <div id=\"" + _self.id("playlist-line-right") + "\" class=\"ts-playlist-line-right\" style=\"height: 0px;\"></div>\n\
							<div id=\"" + _self.id("playlist-box") + "\" class=\"playlist-box pl-box\"></div>\n\
					</div>\n\
					<div class=\"block-right for-playlist\">\n\
						<div class=\"block-shadow\"></div>\n\
						<div class=\"tsplayer-border\"></div>\n\
					</div>\n\
					<div class=\"bottom-yellow\">\n\
						<div class=\"results\">\n\
							<div class=\"inf-img\"></div>\n\
							<span class=\"playlist-pages-info\"></span>\n\
						</div>\n\
					</div>\n\
					<div class=\"bottom-grey\">\n\
						<div class=\"block-footer\">\n\
							<div class=\"img-picto\"><div class=\"curve\"></div></div>\n\
							<a class=\"playlist-check-all ts-button select ts-checked\" href=\"#\">" + _lang.unselectAll + "</a>\n\
							<ul class=\"playlist-pages-container controls-buttons\" id=\"" + _self.id("playlist-pages-container") + "\">\n\
								<li><a href=\"#\" class=\"playlist-prev-page pr-next-button\"><div class=\"arrow-left\"></div> <span class=\"left\">" + _lang.playlistPrev + "</span></a></li>\n\
								<span class=\"playlist-pages\" id=\"" + _self.id("playlist-pages") + "\"></span>\n\
								<li><a href=\"#\" class=\"playlist-next-page pr-next-button\"><span class=\"right\">" + _lang.playlistNext + " </span><div class=\"arrow-right\"></div></a></li>\n\
							</ul>\n\
						</div>\n\
					</div>\n\
				</div>\n\
		</div>\n\
		<!-- RETURN TO MENU BUTTON -->\n\
		<a href=\"#\" class=\"back-to-menu close-window\"></a>\n\
		<!-- TORRENT STREAM -->\n\
		<div class=\"ts-text\"></div>\n\
		<!-- PLAYER CONTROLS -->\n\
        <div class=\"player-controls\">\n\
            <div class=\"controls-container\">\n\
                <div class=\"control button-stop\" rel=\"stop\"></div>\n\
                <div class=\"prev-next\">\n\
                    <div class=\"control button-previous\" rel=\"prev\"></div>\n\
                    <div class=\"control button-next\" rel=\"next\"></div>\n\
                    <div class=\"control button-play\" rel=\"play\"></div>\n\
                </div>\n\
                <div class=\"control button-menu\" rel=\"menu\"></div>\n\
                <div class=\"control button-vol-down\" rel=\"vol-down\"></div>\n\
                <div class=\"control button-sound\" rel=\"vol-mute\"></div>\n\
                <div class=\"control button-vol-up\" rel=\"vol-up\"></div>\n\
                <div class=\"vu\">\n\
                    <div class=\"vu-left\"></div>\n\
                    <div class=\"vu-center\"></div>\n\
                    <div class=\"vu-right\"></div>\n\
                    <div id=\"" + _self.id("duration") + "\" class=\"player-duration\">\n\
					</div>\n\
                    <div class=\"player-status-message\" id=\"" + _self.id("status-wrap") + "\">\n\
                        <div class=\"text-scroll-container\" style=\"position: absolute; width: 1000em; height: 100%; left: 0px; top: 0px;\">\n\
                            <span id=\"" + _self.id("status") + "\" class=\"text-scroll-inner\"></span>\n\
                        </div>\n\
					</div>\n\
                    <div class=\"progress-wrap\" id=\"" + _self.id("progress-wrap") + "\">\n\
                        <div class=\"control progress-placeholder\" id=\"" + _self.id("progress-placeholder") + "\"></div>\n\
                        <div class=\"control progress-bar\" id=\"" + _self.id("progress-bar") + "\">\n\
                            <div class=\"progress-bg\"></div>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
                <div class=\"control button-playlist\" rel=\"playlist\"></div>\n\
                <div class=\"control button-fullscreen\" rel=\"fullscreen\"></div>\n\
                <div class=\"line\"></div>\n\
                <div class=\"control button-power\" rel=\"fullstop\"></div>\n\
            </div>\n\
        </div>\n\
	    </div>\n\
	    </div><!-- END BIG SCREEN -->\n";
	    
	    $("body").append(html);
    }
    
    function attachWhiteScreenEvents() {
        var doc = _contextDocument;
        
        $('#torrentstream-body .big-screen .close-window', doc).click(function() {
                closeScreen();
                return false;
        });
    
        // player controls clicks
        $("#torrentstream-body .player-controls .control", doc).click(function() {
                handleControlClick($(this).attr("rel"));
                return false;
        });
    
        // player controls hover/press
        $("#torrentstream-body .player-controls .button-menu", doc).hover(
            function() { $(this).css({'background-position': '-543px 0px'}); },
            function() { $(this).css({'background-position': '-516px 0px'}); }
            );
        $("#torrentstream-body .player-controls .button-menu", doc).mousedown(function(){ $(this).css({'background-position': '-569px 0px'}); });
        $("#torrentstream-body .player-controls .button-menu", doc).mouseup(function(){ $(this).css({'background-position': '-543px 0px'}); });
    
    
        $("#torrentstream-body .player-controls .button-stop", doc).hover(
            function() { $(this).css({'background-position': '-346px 0px'}); },
            function() { $(this).css({'background-position': '-319px 0px'}); }
            );
        $("#torrentstream-body .player-controls .button-stop", doc).mousedown(function(){ $(this).css({'background-position': '-373px 0px'}); });
        $("#torrentstream-body .player-controls .button-stop", doc).mouseup(function(){ $(this).css({'background-position': '-346px 0px'}); });
    
    
        $("#torrentstream-body .player-controls .button-previous", doc).hover(
            function() { $(this).css({'background-position': '-48px -34px'}); },
            function() { $(this).css({'background-position': '0px -34px'}); }
            );
        $("#torrentstream-body .player-controls .button-previous", doc).mousedown(function(){ $(this).css({'background-position': '-96px -34px'}); });
        $("#torrentstream-body .player-controls .button-previous", doc).mouseup(function(){ $(this).css({'background-position': '-48px -34px'}); });
    
    
        $("#torrentstream-body .player-controls .button-play", doc).hover(
            function() {
                if($(this).data('state') == 'play') {
                    $(this).css({'background-position': '-132px 0px'});
                }
                else {
                    $(this).css({'background-position': '-33px 0px'});
                }
            },
            function() {
                if($(this).data('state') == 'play') {
                    $(this).css({'background-position': '-99px 0px'});
                }
                else {
                    $(this).css({'background-position': '0px 0px'});
                }
            }
            );
        $("#torrentstream-body .player-controls .button-play", doc).mousedown(function(){
                if($(this).data('state') == 'play') {
                    $(this).css({'background-position': '-165px 0px'});
                }
                else {
                    $(this).css({'background-position': '-66px 0px'});
                }
        });
        $("#torrentstream-body .player-controls .button-play", doc).mouseup(function(){
                if($(this).data('state') == 'play') {
                    $(this).css({'background-position': '-99px 0px'});
                }
                else {
                    $(this).css({'background-position': '-33px 0px'});
                }
        });
    
        $("#torrentstream-body .player-controls .button-next", doc).hover(
            function() { $(this).css({'background-position': '-192px -34px'}); },
            function() { $(this).css({'background-position': '-144px -34px'}); }
            );
        $("#torrentstream-body .player-controls .button-next", doc).mousedown(function(){ $(this).css({'background-position': '-240px -34px'}); });
        $("#torrentstream-body .player-controls .button-next", doc).mouseup(function(){ $(this).css({'background-position': '-192px -34px'}); });
    
        $("#torrentstream-body .player-controls .button-vol-down", doc).hover(
            function() { $(this).css({'background-position': '-358px -34px'}); },
            function() { $(this).css({'background-position': '-339px -34px'}); }
            );
        $("#torrentstream-body .player-controls .button-vol-down", doc).mousedown(function(){ $(this).css({'background-position': '-377px -34px'}); });
        $("#torrentstream-body .player-controls .button-vol-down", doc).mouseup(function(){ $(this).css({'background-position': '-358px -34px'}); });
        
        press_and_hold($("#torrentstream-body .player-controls .button-vol-down", doc), function() {
            handleControlClick("vol-down");
        });
        press_and_hold($("#torrentstream-body .player-controls .button-vol-up", doc), function() {
            handleControlClick("vol-up");
        });
    
        $("#torrentstream-body .player-controls .button-vol-up", doc).hover(
            function() { $(this).css({'background-position': '-416px -34px'}); },
            function() { $(this).css({'background-position': '-396px -34px'}); }
            );
        $("#torrentstream-body .player-controls .button-vol-up", doc).mousedown(function(){ $(this).css({'background-position': '-436px -34px'}); });
        $("#torrentstream-body .player-controls .button-vol-up", doc).mouseup(function(){ $(this).css({'background-position': '-416px -34px'}); });
    
        $("#torrentstream-body .player-controls .button-playlist", doc).hover(
            function() { $(this).css({'background-position': '-429px 0px'}); },
            function() { $(this).css({'background-position': '-400px 0px'}); }
            );
        $("#torrentstream-body .player-controls .button-playlist", doc).mousedown(function(){ $(this).css({'background-position': '-458px 0px'}); });
        $("#torrentstream-body .player-controls .button-playlist", doc).mouseup(function(){ $(this).css({'background-position': '-429px 0px'}); });
    
        $("#torrentstream-body .player-controls .button-fullscreen", doc).hover(
            function() { $(this).css({'background-position': '-312px -34px'}); },
            function() { $(this).css({'background-position': '-288px -34px'}); }
            );
    
        // menu options change
        $("#torrentstream-body .menu-switch-down", doc).click(function() {
                var param = $(this).attr("rel");
                if(_player) {
                    var value;
                    if(param == "video-subtitle") {
                        value = _player.subtitle("prev");
                        setSubtitle(value, _player.getVideoSubtitleList());
                    }
                    else if(param == "video-aspect-ratio") {
                        value = _player.aspectRatio("prev");
                        setAspectRatio(value, _player.getVideoAspectRatioList());
                    }
                    else if(param == "video-crop") {
                        value = _player.crop("prev");
                        setCrop(value, _player.getVideoCropList());
                    }
                    else if(param == "audio-track") {
                        value = _player.audioTrack("prev");
                        setAudioTrack(value, _player.getAudioTrackList());
                    }
                    else if(param == "audio-channel") {
                        value = _player.audioChannel("prev");
                        setAudioChannel(value, _player.getAudioChannelList());
                    }
                }
        });
    
        $("#torrentstream-body .menu-switch-up", doc).click(function() {
                var param = $(this).attr("rel");
                if(_player) {
                    var value;
                    if(param == "video-subtitle") {
                        value = _player.subtitle("next");
                        setSubtitle(value, _player.getVideoSubtitleList());
                    }
                    else if(param == "video-aspect-ratio") {
                        value = _player.aspectRatio("next");
                        setAspectRatio(value, _player.getVideoAspectRatioList());
                    }
                    else if(param == "video-crop") {
                        value = _player.crop("next");
                        setCrop(value, _player.getVideoCropList());
                    }
                    else if(param == "audio-track") {
                        value = _player.audioTrack("next");
                        setAudioTrack(value, _player.getAudioTrackList());
                    }
                    else if(param == "audio-channel") {
                        value = _player.audioChannel("next");
                        setAudioChannel(value, _player.getAudioChannelList());
                    }
                }
        });
    
        // menu popup window
        $("#torrentstream-body .menu-dd-open", doc).click(function() {
                var param = $(this).attr("rel");
                $("#torrentstream-body .menu-popup-" + param, doc).show();
    
                var maxw = 0;
                $("#torrentstream-body .menu-popup-" + param + " li", doc).each(function() {
                        if($(this).width() > maxw) {
                            maxw = $(this).width();
                        }
                });
                if(maxw > 0) {
                    $("#torrentstream-body .menu-popup-" + param + " ul").css({"width": maxw});
                }
        });
        
        $("#torrentstream-body .show-popup-embed", doc).click(function() {
            $("#torrentstream-body .menu-popup-embed-code", doc).show();
        });
    
        $("#torrentstream-body .menu-popup-close", doc).click(function() {
                $(this).parent().parent().hide();
        });
    
        // menu-icons
        $("." + _self.id("menu-switch"), doc).click(function() {
                showMenuPage($(this).attr("rel"), doc);
        });
    
        // menu embed code
        $("." + _self.id("embed-size"), doc).click(function() {
                _embedInfo.width = $(this).attr("embed-width");
                _embedInfo.height = $(this).attr("embed-height");
    
                $("." + _self.id("embed-size"), doc).removeClass("current");
                $(this).addClass("current");
    
                updateEmbedCode();
                return false;
        });
    
        //playlist head
        $("#torrentstream-body .td4", doc).html("<span> </span>");
    
        // playlist prev/next
        $("#torrentstream-body .playlist-prev-page", doc).click(function(e) {
                e.preventDefault();
    
                var curr = _playlistInfo.currentPage,
                    newpage = curr - 1,
                    total = _playlistInfo.totalPages;
                if(newpage < 0 || newpage >= total) {
                    return;
                }
    
                // page selector will be updated on scroll event
                var jsp = $("#torrentstream-body .playlist-box", doc).data("jsp");
                if(jsp) {
                    jsp.scrollToY(_playlistInfo.pageHeight * newpage, true);
                }
        });
    
        $("#torrentstream-body .playlist-next-page", doc).click(function(e) {
                e.preventDefault();
    
                var curr = _playlistInfo.currentPage,
                    newpage = curr + 1,
                    total = _playlistInfo.totalPages;
                
                if(newpage < 0 || newpage >= total) {
                    return;
                }
    
                // page selector will be updated on scroll event
                var jsp = $("#torrentstream-body .playlist-box", doc).data("jsp");
                if(jsp) {
                    jsp.scrollToY(_playlistInfo.pageHeight * newpage, true);
                }
        });
    
        // playlist check/uncheck all
        $("#torrentstream-body a.playlist-check-all", doc).click(
            function(e) {
                e.preventDefault();
                var $box = $("#torrentstream-body .playlist-box", doc);
                var enabled;
                if($(this).hasClass("ts-checked")) {
                    enabled = false;
                    $(this).removeClass("ts-checked");
                    $(this).text(_lang.selectAll);
                    $box.find(".playlist-item", doc).removeClass("ts-checked");
                    $box.find(".playlist-play", doc).hide();
                    //$box.find(".playlist-check", doc).attr("checked", false);
                }
                else {
                    enabled = true;
                    $(this).addClass("ts-checked");
                    $(this).text(_lang.unselectAll);
                    $box.find(".playlist-item", doc).addClass("ts-checked");
                    $box.find(".playlist-play", doc).show();
                    //$box.find(".playlist-check", doc).attr("checked", true);
                }
                
                var i, itemCount = _player.playlistSize();
                for(i = 0; i < itemCount; i++) {
                    _player.playlistEnabled(i, enabled);
                }
            });
        
        $("#" + _self.id("progress-placeholder"), _contextDocument).draggable({
                axis: "x",
                containment: "#" + _self.id("progress-wrap"),
                start: function() {
                    _draggingProgress = true;
                    _dragStartPosition = _player.position();
                },
                drag: function(event, ui) {
                    var pos = this.offsetLeft;
                    var w = $(this).parent().width();
                    setPosition(pos / w, true);
                },
                stop: function(event, ui) {
                    _draggingProgress = false;
                    var pos = this.offsetLeft;
                    var w = $(this).parent().width();
                    handleControlClick("progress", pos / w);
                    setPosition(_player.position());
                }
        });
        
        $("#" + _self.id("progress-placeholder"), _contextDocument).mousedown(function(event){
                event.stopPropagation();
        });
        
        $("#" + _self.id("progress-wrap"), _contextDocument).mousedown(function(event){
                var pos = event.offsetX ? event.offsetX : event.pageX - $(this).offset().left;
                var w = $(this).width();
                handleControlClick("progress", pos / w);
        });
    };
    
    function openScreen(callback) {
        var playerHeight = 553,
            winHeight = 0,
            topPosition = 0;
            
        try {
            winHeight = _contextDocument.defaultView.innerHeight;
        }
        catch(e) {
            winHeight = window.innerHeight;
        }
        
        if(winHeight < playerHeight) {
            topPosition = 0;
        }
        else {
            topPosition = (winHeight - playerHeight) / 2;
        }
        _log("openScreen: playerHeight=" + playerHeight + " winHeight=" + winHeight + " topPosition=" + topPosition);
    
        hideEmbedElements();
        $('#torrentstream-body .big-screen', _contextDocument).stop().animate({
                top: topPosition + 'px'
        }, 600, 'easeOutQuart', function() {
            $('#torrentstream-body .big-screen .page', _contextDocument).fadeIn(300, function() {
                if(typeof callback === 'function') {
                    callback.call(_self);
                }
            });
        });
        $('#torrentstream-body .overlay-background', _contextDocument).fadeIn(300);
    }
    
    function closeScreen() {
        _self.destroyPlayer();
        showEmbedElements();
    
        _log("closeScreen: ---");
        $('#torrentstream-body .big-screen', _contextDocument).stop().animate({
                top: -640 + 'px'
        }, 600, 'easeInQuart');
        $('#torrentstream-body .big-screen .page', _contextDocument).fadeOut(300);
    
        showMenu(false);
        showPlaylist(false);
        
        $("#torrentstream-body .player-controls .button-play", _contextDocument).data("state", "stop").css("background-position", "0px 0px");
        $('#torrentstream-body .overlay-background', _contextDocument).fadeOut(300);
    }
    
    function showEmbedElements() {
        var objects = _contextDocument.getElementsByTagName('embed');
        setTimeout(function () {
                var i;
                for (i=0; i<objects.length; i++) {
                    if (objects[i].type == 'application/x-shockwave-flash') {
                        objects[i].style['visibility'] = 'visible';
                    }
        }}, 700);
        $('iframe', _contextDocument).each(function() { $(this).css("visibility", "visible"); });
        $('object', _contextDocument).each(function() { $(this).css("visibility", "visible"); });
    }
    
    function hideEmbedElements() {
        var i;
        var objects = _contextDocument.getElementsByTagName('embed');
        for (i=0; i<objects.length; i++) {
            if (objects[i].type == 'application/x-shockwave-flash') {
                objects[i].style['visibility'] = 'hidden';
            }
        }
        $('iframe', _contextDocument).each(function() { $(this).css("visibility", "hidden"); });
        $('object', _contextDocument).each(function() { $(this).css("visibility", "hidden"); });
    }
    
    function createContainer()
    {
        _log("createContainer: container=" + container);
        
        if(typeof container === 'string') {
            container = "#" + container;
        }
        
        var $new_container = $('<div class="torrentstream-container" id="' + _self.id() + '"></div>', _contextDocument);
        var $container = $(container, _contextDocument);
        
        if($container.size() == 0) {
            throw "Controls::createContainer: container not found: " + container;
        }
        
        $container.html("").append($new_container);
        container = $new_container;
        
        $(container, _contextDocument).append('<div class="ts-content" id="' + _self.id("content") + '"></div>');
        $(container, _contextDocument).append('<div class="ts-infowindow" id="' + _self.id("infowindow") + '"></div>');
        if(_showBigPlayButton) {
            $(container, _contextDocument).append('<div class="ts-big-play-button" id="' + _self.id("big-play-button") + '"></div>');
        }
    }
    
    function createControls()
    {
        _log("createControls");
        var html = "",
        containerHeight = $(container, _contextDocument).height();
        containerWidth = $(container, _contextDocument).width();
        
        // menu box
        $(container, _contextDocument).append(
            '<div class="ts-menu-box" id="' + _self.id("menu-box") + '">'+
            '<div class="ts-menu-top" id="' + _self.id("menu-top") + '">'+
                '<div class="ts-menu-icon-main ts-menu-icon ' + _self.id("menu-icon") + ' ' + _self.id("menu-switch") + '" rel="main" title="Main"></div>'+
                '<div class="ts-menu-icon-line ts-line1"></div>'+
                '<div class="ts-menu-icon-video ts-menu-icon ' + _self.id("menu-icon") + ' ' + _self.id("menu-switch") + '" rel="video" title="Video"></div>'+
                '<div class="ts-menu-icon-line ts-line2"></div>'+
                '<div class="ts-menu-icon-audio ts-menu-icon ' + _self.id("menu-icon") + ' ' + _self.id("menu-switch") + '" rel="audio" title="Audio"></div>'+
                '<div class="ts-menu-icon-line ts-line3"></div>'+
                '<div class="ts-menu-icon-social ts-menu-icon ' + _self.id("menu-icon") + ' ' + _self.id("menu-switch") + '" rel="social" title="Social"></div>'+
                '<div class="ts-menu-icon-line ts-line4"></div>'+
                '<div class="ts-close ' + _self.id("close") + '"></div>'+
                '<div class="ts-menu-icon-selected" id="' + _self.id("menu-icon-selected") + '"></div>'+
            '</div>'+
            '<div class="ts-menu-left" id="' + _self.id("menu-left") + '" style="width: ' + (containerWidth - _menuRightWidth - 1) + 'px; height: ' + (containerHeight - 27) + 'px;">'+
            '<div class="top ts-top"></div>'+
            
            // menu page main
            '<div id="' + _self.id("menu-page-main") + '" class="ts-menu-page-main ts-menu-page ' + _self.id("menu-page") + '" rel="main">'+
                '<div class="ts-menu-go ts-menu-go-video ' + _self.id("menu-switch") + '" rel="video">'+
                    _lang.menuVideo+
                '</div>'+
                '<div class="ts-menu-go ts-menu-go-audio ' + _self.id("menu-switch") + '" rel="audio">'+
                    _lang.menuAudio+
                '</div>'+
                '<div class="ts-menu-go ts-menu-go-social ' + _self.id("menu-switch") + '" rel="social">'+
                    _lang.menuSocial+
                '</div>'+
            '</div>'+
            
            // menu page video
            '<div id="' + _self.id("menu-page-video") + '" class="ts-menu-page-video ts-menu-page ' + _self.id("menu-page") + '" rel="video">'+
            '<div class="ts-menu-page-title">' + _lang.menuVideo + '</div>'+
            
            // video.subtitle
            '<div class="ts-video-subtitle-box">'+
            '<div class="ts-menu-page-text">' + _lang.subtitle + ':</div>'+
            '<div class="ts-menu-switch-down ' + _self.id("menu-switch-down") + '" rel="video-subtitle">-</div>'+
            '<div class="ts-select-box-bg">'+
            '<span class="ts-select-box-bg-left"></span>'+
            '<div class="ts-menu-video-subtitle-value" id="' + _self.id("menu-video-subtitle-value") + '"></div>'+
            '<div class="ts-menu-dd-open ' + _self.id("menu-dd-open") + '" rel="video-subtitle"></div>'+
            '</div>'+
            '<div class="ts-menu-switch-up ' + _self.id("menu-switch-up") + '" rel="video-subtitle">+</div>'+
            '</div>'+
            
            // video aspect ratio
            '<div class="ts-video-subtitle-box">'+
            '<div class="ts-menu-page-text">' + _lang.aspectRatio + ':</div>'+
            '<div class="ts-menu-switch-down ' + _self.id("menu-switch-down") + '" rel="video-aspect-ratio">-</div>'+
            '<div class="ts-select-box-bg">'+
            '<span class="ts-select-box-bg-left"></span>'+
            '<div class="ts-menu-video-aspect-ratio-value" id="' + _self.id("menu-video-aspect-ratio-value") + '"></div>'+
            '<div class="ts-menu-dd-open ' + _self.id("menu-dd-open") + '" rel="video-aspect-ratio"></div>'+
            '</div>'+
            '<div class="ts-menu-switch-up ' + _self.id("menu-switch-up") + '" rel="video-aspect-ratio">+</div>'+
            '</div>'+
            
            // video crop
            '<div class="ts-video-subtitle-box">'+
            '<div class="ts-menu-page-text">' + _lang.crop + ':</div>'+
            '<div class="ts-menu-switch-down ' + _self.id("menu-switch-down") + '" rel="video-crop">-</div>'+
            '<div class="ts-select-box-bg">'+
            '<span class="ts-select-box-bg-left"></span>'+
            '<div class="ts-menu-video-crop-value" id="' + _self.id("menu-video-crop-value") + '"></div>'+
            '<div class="ts-menu-dd-open ' + _self.id("menu-dd-open") + '" rel="video-crop"></div>'+
            '</div>'+
            '<div class="ts-menu-switch-up ' + _self.id("menu-switch-up") + '" rel="video-crop">+</div>'+
            '</div>'+
            
            // popup.video.subtitle
            '<div class="ts-menu-popup-video" id="' + _self.id("menu-popup-video-subtitle") + '">'+
            '<div class="ts-menu-popup-overlay"></div>'+
            '<div class="ts-menu-popup-box">'+
            '<div class="ts-menu-popup-close ' + _self.id("menu-popup-close") + '"></div>'+
            '<ul class="ts-menu-options-video-subtitle" id="' + _self.id("menu-options-video-subtitle") + '" rel="video-subtitle"></ul>'+
            '</div>'+
            '</div>'+
            
            // popup.video.aspect_ratio
            '<div class="ts-menu-popup-video" id="' + _self.id("menu-popup-video-aspect-ratio") + '">'+
            '<div class="ts-menu-popup-overlay"></div>'+
            '<div class="ts-menu-popup-box">'+
            '<div class="ts-menu-popup-close ' + _self.id("menu-popup-close") + '"></div>'+
            '<ul class="ts-menu-options-video-aspect-ratio" id="' + _self.id("menu-options-video-aspect-ratio") + '" rel="video-aspect-ratio""></ul>'+
            '</div>'+
            '</div>'+
            
            // popup.video.crop
            '<div class="ts-menu-popup-video" id="' + _self.id("menu-popup-video-crop") + '">'+
            '<div class="ts-menu-popup-overlay"></div>'+
            '<div class="ts-menu-popup-box">'+
            '<div class="ts-menu-popup-close ' + _self.id("menu-popup-close") + '"></div>'+
            '<ul class="ts-menu-options-video-crop" id="' + _self.id("menu-options-video-crop") + '" rel="video-crop"></ul>'+
            '</div>'+
            '</div>'+
            '</div>'+
            
			// MENU PAGE AUDIO
            '<div id="' + _self.id("menu-page-audio") + '" class="ts-menu-page-audio ts-menu-page ' + _self.id("menu-page") + '" rel="audio">'+
            '<div class="ts-menu-page-title">' + _lang.menuAudio + '</div>'+
            
            // audio.track
            '<div class="ts-video-subtitle-box">'+
            '<div class="ts-menu-page-text">' + _lang.audioTrack + ':</div>'+
            '<div class="ts-menu-switch-down ' + _self.id("menu-switch-down") + '" rel="audio-track">-</div>'+
            '<div class="ts-select-box-bg">'+
            '<span class="ts-select-box-bg-left"></span>'+
            '<div class="ts-menu-audio-track-value" id="' + _self.id("menu-audio-track-value") + '"></div>'+
            '<div class="ts-menu-dd-open ' + _self.id("menu-dd-open") + '" rel="audio-track"></div>'+
            '</div>'+
            '<div class="ts-menu-switch-up ' + _self.id("menu-switch-up") + '" rel="audio-track">+</div>'+
            '</div>'+
            
            // audio.channel
            '<div class="ts-video-subtitle-box">'+
            '<div class="ts-menu-page-text">' + _lang.audioChannel + ':</div>'+
            '<div class="ts-menu-switch-down ' + _self.id("menu-switch-down") + '" rel="audio-channel">-</div>'+
            '<div class="ts-select-box-bg">'+
            '<span class="ts-select-box-bg-left"></span>'+
            '<div class="ts-menu-audio-channel-value" id="' + _self.id("menu-audio-channel-value") + '"></div>'+
            '<div class="ts-menu-dd-open ' + _self.id("menu-dd-open") + '" rel="audio-channel"></div>'+
            '</div>'+
            '<div class="ts-menu-switch-up ' + _self.id("menu-switch-up") + '" rel="audio-channel">+</div>'+
            '</div>'+
            
            // popup.audio.track
            '<div class="ts-menu-popup-video" id="' + _self.id("menu-popup-audio-track") + '">'+
            '<div class="ts-menu-popup-overlay"></div>'+
            '<div class="ts-menu-popup-box">'+
            '<div class="ts-menu-popup-close ' + _self.id("menu-popup-close") + '"></div>'+
            '<ul class="ts-menu-options-audio-track" id="' + _self.id("menu-options-audio-track") + '" rel="audio-track"></ul>'+
            '</div>'+
            '</div>'+
            
            // popup.audio.channel
            '<div class="ts-menu-popup-video" id="' + _self.id("menu-popup-audio-channel") + '">'+
            '<div class="ts-menu-popup-overlay"></div>'+
            '<div class="ts-menu-popup-box">'+
            '<div class="ts-menu-popup-close ' + _self.id("menu-popup-close") + '"></div>'+
            '<ul class="ts-menu-options-audio-channel" id="' + _self.id("menu-options-audio-channel") + '" rel="audio-channel"></ul>'+
            '</div>'+
            '</div>'+
            
            '</div>'+
            
            // menu page social
            '<div class="ts-menu-page-social ts-menu-page ' + _self.id("menu-page") + '" rel="social">'+
            '<div class="ts-menu-page-title">' + _lang.menuSocial + '</div>'+
            
            '<div class="ts-social-box">'+
				'<div class="label">' + _lang.embedLink + '</div>'+
                '<input class="ts-input" id="' + _self.id("player-embed-link") + '" type="text" value="" onclick="this.focus(); this.select();" readonly="readonly" />'+
            '</div>'+
			
			'<div class="ts-social-box">'+
				'<div class="label">' + _lang.contentId + '</div>'+
                '<input class="ts-input" id="' + _self.id("player-embed-id") + '" type="text" value="" onclick="this.focus(); this.select();" readonly="readonly" />'+
            '</div>'+
            
            '<div class="ts-links-container">'+
                '<a href="#"  target="_blank" id="' + _self.id("share-link-fb") + '"><div class="ts-facebook ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-vk") + '"><div class="ts-vkontakte ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-twitter") + '"><div class="ts-twitter ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-buzz") + '"><div class="ts-buzz ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-mailru") + '"><div class="ts-mailru ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-myspace") + '"><div class="ts-myspace ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-lj") + '"><div class="ts-lj ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-odnoklassniki") + '"><div class="ts-odnoklassniki ts-link-icon"></div></a>'+
                ' <a href="#" target="_blank" id="' + _self.id("share-link-blogger") + '"><div class="ts-blogger ts-link-icon"></div></a>'+
            '</div>'+
            
            '<div class="ts-embed-code-container">'+
                '<div class="ts-menu-show-embed-code" id="' + _self.id("menu-show-embed-code") + '">'+
                    _lang.embedCode+
                '</div>'+
            '</div>'+
            
            '<div class="ts-menu-popup-embed-code" id="' + _self.id("menu-popup-embed-code") + '">'+
                '<div class="ts-menu-popup-overlay"></div>'+
                '<div class="ts-embed-popup-box">'+
                    '<div class="ts-menu-popup-close ' + _self.id("menu-popup-close") + '"></div>'+
                    '<div class="ts-embed-area">'+
                        _lang.embedCode + '<br/>' +
                        '<textarea class="ts-textarea" id="' + _self.id("player-embed-code-iframe") + '" readonly="readonly" onclick="this.focus(); this.select();"></textarea>'+
                    '</div>'+
                    '<div class="ts-choose">'+
                        '<div class="ts-size">'+
                            '650x521'+
                            '<div class="ts-embed-size ts-650x521 ' + _self.id("embed-size") + '" embed-width="650" embed-height="521"></div>'+
                        '</div>'+
                        '<div class="ts-size ts-margin">'+
                            '650x399'+
                            '<div class="ts-embed-size ts-650x399 ts-current ' + _self.id("embed-size") + ' ' + _self.id("selected") + '" embed-width="650" embed-height="399"></div>'+
                        '</div>'+
                        '<div class="ts-size ts-margin">'+
                            '650x439'+
                            '<div class="ts-embed-size ts-650x439 ' + _self.id("embed-size") + '" embed-width="650" embed-height="439"></div>'+
                        '</div>'+
                        '<div class="ts-size ts-margin">'+
                            '798x342'+
                            '<div class="ts-embed-size ts-798x342 ' + _self.id("embed-size") + '" embed-width="798" embed-height="342"></div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '</div>'+
            
            // menu page info
            '<div id="' + _self.id("menu-page-info") + '" class="ts-menu-page-info ts-menu-page' + _self.id("menu-page") + '" rel="info">'+
            '<div class="ts-menu-page-title">' + _lang.menuInfo + '</div>'+
            '</div>'+
            
            
            '</div>'+
            '<div class="ts-menu-right" id="' + _self.id("menu-right") + '" style="width: ' + _menuRightWidth + 'px; height: ' + (containerHeight - 27) + 'px;">'+
            '</div>'+
            '</div>'
            );
        
        // playlist box
		if(conf.youtube) {
			$(container, _contextDocument).append(
				'<div class="ts-playlist-container" id="' + _self.id("playlist-container") + '">'+
				
				// playlist top
				'<div class="ts-playlist-top" id="' + _self.id("playlist-top") + '" style="">'+
				'<div class="ts-playlist-close' + _self.id("close") + '"></div>'+
				'<div class="ts-playlist-title">' + _lang.formatList + '</div>'+
				'</div>'+
				
				// playlist left
				'<div class="ts-playlist-left" id="' + _self.id("playlist-left") + '">'+
				'<div class="ts-playlist-header">'+
				'<div class="ts-header-height">'+
				'<div class="ts-text" style="left: 9px;">'+
				_lang.formatName+
				'</div>'+
				'<div class="ts-playlist-spacer spacer2"></div>'+
				'</div>'+
				'</div>'+
				'<div class="ts-playlist-box" id="' + _self.id("playlist-box") + '"></div>'+
				'</div>'+
				
				// playlist right
				'<div class="ts-playlist-right" id="' + _self.id("playlist-right") + '" style="width: ' + _menuRightWidth + 'px;">'+
				'<div class="ts-top-right"></div>'+
				'<div class="ts-bottom-right"></div>'+
				'</div>'+
				
				'</div>'
			);
		} else {
			$(container, _contextDocument).append(
				'<div class="ts-playlist-container" id="' + _self.id("playlist-container") + '">'+
				
				// playlist top
				'<div class="ts-playlist-top" id="' + _self.id("playlist-top") + '" style="">'+
				'<div class="ts-playlist-close' + _self.id("close") + '"></div>'+
				'<div class="ts-playlist-title">' + _lang.playlist + '</div>'+
				'</div>'+
				
				// playlist left
				'<div class="ts-playlist-left" id="' + _self.id("playlist-left") + '">'+
				'<div class="ts-playlist-header">'+
				'<div class="ts-header-height">'+
				'<div class="ts-loader"></div>'+
				'<div class="ts-playlist-spacer"></div>'+
				'<div class="ts-text">'+
				_lang.name+
				'</div>'+
				'<div class="ts-playlist-spacer spacer2"></div>'+
				'</div>'+
				'</div>'+
				'<div class="ts-playlist-box" id="' + _self.id("playlist-box") + '"></div>'+
				'</div>'+
				
				// playlist right
				'<div class="ts-playlist-right" id="' + _self.id("playlist-right") + '" style="width: ' + _menuRightWidth + 'px;">'+
				'<div class="ts-top-right"></div>'+
				'<div class="ts-bottom-right"></div>'+
				'</div>'+
				
				// playlist bottom
				'<div class="ts-playlist-bottom" id="' + _self.id("playlist-bottom") + '">'+
				
				'<div class="ts-arrow"></div>'+
				'<div class="ts-check-all ' + _self.id("check-all") + '" rel="ts-checked">'+
				_lang.unselectAll+
				'</div>'+
				
				'<div class="ts-playlist-pages-container" id="' + _self.id("playlist-pages-container") + '">'+
				'<div class="ts-playlist-next-page" id="' + _self.id("playlist-next-page") + '">'+
				_lang.playlistNext+
				'</div>'+
				'<div class="ts-playlist-pages" id="' + _self.id("playlist-pages") + '">'+
				'</div>'+
				'<div class="ts-playlist-prev-page" id="' + _self.id("playlist-prev-page") + '">'+
				_lang.playlistPrev+
				'</div>'+
				'</div>'+
				
				'</div>'+
				
				'</div>'
			);
		}
        
        // controls box
        html = '<div class="ts-controls" id="' + _self.id("controls") + '">'+
            '<div class="ts-controls-right"></div>'+
            '<div class="ts-controls-right-next"></div>';
        if(conf.youtube) {
			html += '<ul class="ts-buttons-container ts-yt" id="' + _self.id("buttons-container") + '">'+
            '<li style="background-position: 0 -199px" class="ts-buttons-bg" id="' + _self.id("buttons-bg") + '"></li>'+
            '<li class="ts-btn" style="width: 30px; margin: 0 12px;"><div class="ts-play" id="' + _self.id("play") + '" title="' + _lang.play + '"></div></li>'+
            '</ul>'+
			'<div class="ts-btn-menu btn-menu" style="left: 54px;">'+
            '<div class="ts-menu" id="' + _self.id("menu") + '" title="' + _lang.menu + '"></div>'+
            '</div>'+
            '<div style="left: 88px;" class="ts-vol-down" id="' + _self.id("vol-down") + '" title="' + _lang.volumeDown + '"></div>'+
            '<div style="left: 106px;" class="ts-vol-switch" id="' + _self.id("vol-switch") + '" title="' + _lang.volumeOff + '"></div>'+
            '<div style="left: 122px;" class="ts-vol-up" id="' + _self.id("vol-up") + '" title="' + _lang.volumeUp + '"></div>'+
			'<div class="ts-progress-box" style="left: 144px; right: 220px;">';
		}
		else {
			html += '<ul class="ts-buttons-container" id="' + _self.id("buttons-container") + '">'+
            '<li class="ts-buttons-bg" id="' + _self.id("buttons-bg") + '"></li>'+
            '<li class="ts-btn" style="margin: 0 0 0 5px;"><div class="ts-stop" id="' + _self.id("stop") + '" title="' + _lang.stop + '"></div></li>'+
            '<li class="ts-btn" style="width: 30px;"><div class="ts-play" id="' + _self.id("play") + '" title="' + _lang.play + '"></div></li>'+
            '<li class="ts-btn"><div class="ts-next" id="' + _self.id("next") + '" title="' + _lang.next + '"></div></li>'+
            '</ul>'+
			'<div class="ts-btn-menu btn-menu">'+
            '<div class="ts-menu" id="' + _self.id("menu") + '" title="' + _lang.menu + '"></div>'+
            '</div>'+
            '<div class="ts-vol-down" id="' + _self.id("vol-down") + '" title="' + _lang.volumeDown + '"></div>'+
            '<div class="ts-vol-switch" id="' + _self.id("vol-switch") + '" title="' + _lang.volumeOff + '"></div>'+
            '<div class="ts-vol-up" id="' + _self.id("vol-up") + '" title="' + _lang.volumeUp + '"></div>'+
			'<div class="ts-progress-box" style="right: 93px;position: absolute; left: 189px;top: 0px; height: 33px;">';
		}
        html += '<div class="ts-duration-container-left"></div>'+
        '<div class="ts-duration-container"></div>'+
        '<div class="ts-duration-container-right"></div>'+
        '<div class="ts-duration" id="' + _self.id("duration") + '"></div>'+
        '<div class="ts-status-wrap" id="' + _self.id("status-wrap") + '">'+
        '<div class="ts-text-scroll-container-status text-scroll-container">'+
        '<span id="' + _self.id("status") + '" class="text-scroll-inner"></span>'+
        '</div>'+
        '</div>'+
        '<div class="ts-progress-wrap" id="' + _self.id("progress-wrap") + '">'+
        '<div class="ts-progress-bar" id="' + _self.id("progress-bar") + '">'+
        '<div class="ts-progress-line"></div>'+
        '</div>'+
        '<div class="ts-progress-placeholder" id="' + _self.id("progress-placeholder") + '"></div>'+
        '</div>'+
        '</div>';
        
        if(conf.youtube) {
            try {
				var currentFormatName = conf.youtube.showFormats[conf.youtube.currentFormat].data.nameShort;
                html += '<div class="ts-save" id="' + _self.id("playlist") + '" title="' + _lang.save + '">' + _lang.save + '</div>'+
                '<div class="ts-yt-format" id="' + _self.id("yt-format") + '" title="' + _lang.format + '">'+ currentFormatName +
                '</div>'+
                '<div class="ts-yt-squeeze" id="' + _self.id("yt-squeeze") + '" title="' + _lang.squeeze + '"></div>'+
                '<div class="ts-yt-expand" id="' + _self.id("yt-expand") + '" title="' + _lang.expand + '"></div>';
            }
            catch(e) {
                _log("exc: " + e);
            }
        }
        else {
            html += '<div class="ts-playlist" id="' + _self.id("playlist") + '" title="' + _lang.playlist + '"></div>';
        }
        
        html += '<div class="ts-fullscreen" id="' + _self.id("fullscreen") + '" title="' + _lang.fullscreen + '"></div>'+
        '<div class="ts-power" id="' + _self.id("power") + '" title="' + _lang.stopDownload + '"></div>'+
        '</div>';
        
        $(container, _contextDocument).append(html);
        
        if(conf.youtube) {
            var htmlAvailFormats = "",
                listFormats = [];
                
            for(var id in conf.youtube.showFormats) {
                listFormats.push(conf.youtube.showFormats[id]);
            }
            
            listFormats.sort(function(a, b) {
                    return b.data.quality - a.data.quality;
            });
            
            for(var i = 0, len = listFormats.length; i < len; i++) {
                var f = listFormats[i],
                    id = f.data.itag,
                    name = f.data.nameFull;
                    
                htmlAvailFormats += '<li rel="' + id + '" style="';
                if(id == conf.youtube.currentFormat) {
                    htmlAvailFormats += '" class="current"';
                }
                else {
                    htmlAvailFormats += '"';
                }
                htmlAvailFormats += '>' + name + '</li>';
            }
            $(container, _contextDocument).append(
                '<div class="ts-yt-formats-list" id="' + _self.id("yt-formats-list") + '" style="top:' + _containerHeight + 'px;">'+
                '<ul class="ts-youTube-formats-list">'+
                htmlAvailFormats+
                '</ul>'+
                '</div>'
                );
        }
    }
    
    function setPosition(pos, skipPlaceholder)
    {
        var pos2 = (pos > 0.987) ? 0.987 : pos;
        $("#"+_self.id("progress-bar"), _contextDocument).css({width: (pos2 * 100) + "%"});
        if( ! skipPlaceholder) {
            _dragStartPosition = pos;
            pos2 = (pos > 0.957) ? 0.957 : pos;
            $("#"+_self.id("progress-placeholder"), _contextDocument).css({left: (pos2 * 100) + "%"});
        }
    }
    
    function formatDuration(duration)
    {
        if(!duration) {
            return "";
        }
        var s = "", h = 0, m = 0;
        duration = Math.round(duration);
        h = Math.floor(duration / 3600);
        duration -= h * 3600;
        m = Math.floor(duration / 60);
        duration -= m * 60;
        s = (("0" + h).slice(-2)) + ":" + (("0" + m).slice(-2)) + ":" + (("0" + duration).slice(-2));
        return s;
    }
    
    function setDuration(val)
    {
        $("#"+_self.id("duration"), _contextDocument).text(val);
        if(conf.cufonEnabled) {
            TorrentStream.Cufon.replace("#"+_self.id("duration"), { fontFamily: "a_LCDNova"});
            $("#"+_self.id("duration"), _contextDocument).show();
        }
    }
    
    function setAudioTrack(val, list)
    {
        if(val === -1) {
            val = _lang.notAvailable;
        }
        else if(val === 0) {
            val = _lang.off;
        }
        else {
            try {
                val = list[val];
            }
            catch(e) {
                val = "?";
            }
        }
        $("#"+_self.id("menu-audio-track-value"), _contextDocument).text(val);
    }
    
    function setAudioChannel(idx, list)
    {
        var val;
        try {
            val = list[idx];
            if(_lang["audioChannel_" + val] !== undefined) {
                val = _lang["audioChannel_" + val];
            }
        }
        catch(e) {}
        
        if(!val) {
            val = _lang.audioChannel_default;
        }
        $("#"+_self.id("menu-audio-channel-value"), _contextDocument).text(val);
    }
    
    function setSubtitle(val, list)
    {
        if(val === -1) {
            val = _lang.notAvailable;
        }
        else if(val === 0) {
            val = _lang.off;
        }
        else {
            try {
                val = list[val];
            }
            catch(e) {
                val = "?";
            }
        }
        $("#"+_self.id("menu-video-subtitle-value"), _contextDocument).text(val);
    }
    
    function setAspectRatio(idx, list)
    {
        var val;
        try {
            val = list[idx];
            if(_lang["videoAspectRatio_" + val] !== undefined) {
                val = _lang["videoAspectRatio_" + val];
            }
        }
        catch(e) {}
        
        if(!val) {
            val = _lang.videoAspectRatio_default;
        }
        $("#"+_self.id("menu-video-aspect-ratio-value"), _contextDocument).text(val);
    }
    
    function setCrop(idx, list)
    {
        var val;
        try {
            val = list[idx];
            if(_lang["videoCrop_" + val] !== undefined) {
                val = _lang["videoCrop_" + val];
            }
        }
        catch(e) {}
        
        if(!val) {
            val = _lang.videoCrop_default;
        }
        $("#"+_self.id("menu-video-crop-value"), _contextDocument).text(val);
    }
    
    function initCss()
    {
        try {
            var style, d = _contextDocument, css = '/* jScrollPane*/ .jspContainer { overflow: hidden;position: relative;}.jspPane { position: absolute;}.jspVerticalBar { position: absolute;top: 0;right: 0;width: 0px;height: 100%;background: red;}.jspHorizontalBar { position: absolute;bottom: 0;left: 0;width: 100%;height: 16px;background: red;}.jspVerticalBar *, .jspHorizontalBar * { margin: 0;padding: 0;}.jspCap { display: none;}.jspHorizontalBar .jspCap { float: left;}.jspTrack { background: #dde;position: relative;}.jspDrag { background: #bbd;position: relative;top: 0;left: 0;cursor: pointer;}.jspHorizontalBar .jspTrack, .jspHorizontalBar .jspDrag { float: left;height: 100%;}.jspArrow { background: #50506d;text-indent: -20000px;display: block;cursor: pointer;}.jspArrow.jspDisabled { cursor: default;background: #80808d;}.jspVerticalBar .jspArrow { height: 16px;}.jspHorizontalBar .jspArrow { width: 16px;float: left;height: 100%;}.jspVerticalBar .jspArrow:focus { outline: none;}.jspCorner { background: #eeeef4;float: left;height: 100%;}/* Yuk! CSS Hack for IE6 3 pixel bug :( */ * html .jspCorner { margin: 0 -3px 0 0;}';
            style = d.createElement("style");
            style.setAttribute("type", "text/css");
            if(style.styleSheet) {
                // IE
                style.styleSheet.cssText = css;
            }
            else {
                // normal
                var s = d.createTextNode(css);
                style.appendChild(s);
            }
            d.getElementsByTagName("head")[0].appendChild(style);
        }
        catch(e) {
            _log("initCss: " + e);
        }
    }
    
    function _play() {
        if(_player) {
            _player.play();
        }
        else {
            _log("_play: no player, force autoplay on attach");
            _forceAutoplay = true;
        }
    }
    
    function attachCommonEvents()
    {
        if(_showBigPlayButton) {
            $("#" + _self.id("big-play-button"), _contextDocument).hover(
                function() {
                    $(this).css('background-position', '-108px 0');
                },
                function() {
                    $(this).css('background-position', '0 0');
                }
                );
        }
        
        $("#" + _self.id("big-play-button"), _contextDocument).click(function() {
                $(this).hide();
                _play();
        });
    }
    
    function handleControlClick(control)
    {
        if(!_player) {
            if(control == "play") {
                _play();
                return true;
            }
            else {
                _log("handleControlClick: no player");
                return false;
            }
        }
        
        if(_player.blocked()) {
            _log("handleControlClick: player is blocked");
            return false;
        }
        
        _log("handleControlClick: control=" + control);
        
        var retval = true;
        if(control == "play") {
            retval = _player.play();
        }
        else if(control == "stop") {
            retval = _player.stop();
        }
        else if(control == "prev") {
            retval = _player.prev();
        }
        else if(control == "next") {
            retval = _player.next();
        }
        else if(control == "vol-down") {
            retval = _player.volume(-1);
        }
        else if(control == "vol-up") {
            retval = _player.volume(1);
        }
        else if(control == "vol-mute") {
            retval = _player.toggleMute();
        }
        else if(control == "fullscreen") {
            retval = _player.toggleFullscreen();
        }
        else if(control == "fullstop") {
            retval = _player.stop(true);
        }
        else if(control == "progress") {
            if(arguments.length >= 2) {
                retval = _player.position(arguments[1]);
            }
        }
        else if(control == "menu") {
            showMenu(!_menuVisible);
        }
        else if(control == "playlist") {
            showPlaylist(!_playlistInfo.visible);
        }
        
        return retval;
    }
    
    function attachControlsEvents()
    {
        // sliding background under buttons
        var options = {
            speed: 200,
            container: $("#" + _self.id("buttons-container"), _contextDocument),
            bg: $("#" + _self.id("buttons-bg"), _contextDocument),
            initial_height: 0,
            initial_width: 0
        };
        options.initial_height = options.container.find("li:eq(0)").find("div:eq(0)").outerHeight();
        options.initial_width = options.container.find("li:eq(0)").find("div:eq(0)").outerWidth();
        options.bg.css({
                width: options.initial_width,
                height: options.initial_height,
                display: "block"
        });
        options.container.find("li div").hover(
            function(){
				if(conf.youtube) {
					var t = $(this).parent().position().top;
					var l = $(this).parent().parent().position().left;
					var w = $(this).parent().outerWidth()*1.5;
					var h = $(this).parent().outerHeight();
				}
				else {
					var t = $(this).parent().position().top;
					var l = $(this).position().left;
					var w = $(this).parent().outerWidth();
					var h = $(this).parent().outerHeight();
				}
                
                options.bg.stop().animate({
                        opacity: 1,
                        top: t + "px",
                        left: l + "px",
                        width: w + "px",
                        height: h + "px"
                }, options.speed);
            },
            function(){
                options.bg.stop().animate({
                        opacity: 0
                }, 500);
            });
			
        if(conf.youtube) {
			options.container.find("li div").mousedown(function(){
                options.bg.css({'background-position': '-54px -199px'});
			});
			options.container.find("li div").mouseup(function(){
					options.bg.css({'background-position': '0px -199px'});
			});
		}
		else {
			options.container.find("li div").mousedown(function(){
                options.bg.css({'background-position': '-359px 0'});
			});
			options.container.find("li div").mouseup(function(){
					options.bg.css({'background-position': '-329px 0'});
			});
		}
        
        // play/pause
        $("#" + _self.id("play")).click(function() {
                handleControlClick("play");
        });
        
        // stop
        $("#" + _self.id("stop")).click(function() {
                handleControlClick("stop");
        });
        
        // next
        $("#" + _self.id("next")).click(function() {
                handleControlClick("next");
        });
        
        // volume
        $("#" + _self.id("vol-switch")).click(function() {
                handleControlClick("vol-mute");
        });
        
        // fullscreen
        $("#" + _self.id("fullscreen")).click(function() {
                handleControlClick("fullscreen");
        });
        
        // fullstop
        $("#" + _self.id("power")).click(function() {
                handleControlClick("fullstop");
        });
        
        $("." + _self.id("embed-size"), _contextDocument).click(function() {
                _embedInfo.width = $(this).attr("embed-width");
                _embedInfo.height = $(this).attr("embed-height");
                
                updateEmbedCode();
                
                $("." + _self.id("embed-size"), _contextDocument).css({
                        'background-color': '#aaa',
                        'border': '1px solid #444'
                });
                $(this).css({
                        'background-color': '#77DDFF',
                        'border': '1px solid #3399CC'
                });
        });
        
        $("#" + _self.id("menu-page-main") + " ." + _self.id("menu-switch"), _contextDocument).hover(
            function() {
                $(this).addClass("ts-hover");
            },
            function() {
				$(this).removeClass("ts-hover");
            }
            );
        
        $("#" + _self.id("menu"), _contextDocument).hover(
            function() {
                $(this).parent().css({'background-position': '-201px 0'});
            },
            function() {
                $(this).parent().css({'background-position': '-172px 0'});
            }
            );
        $("#" + _self.id("menu"), _contextDocument).mousedown(function(){ $(this).parent().css({'background-position': '-143px 0'}); });
        $("#" + _self.id("menu"), _contextDocument).mouseup(function(){ $(this).parent().css({'background-position': '-201px 0'}); });
        
        $("#" + _self.id("vol-down"), _contextDocument).hover(
            function() { $(this).css({'background-position': '-18px -33px'}); },
            function() { $(this).css({'background-position': '0 -33px'}); }
            );
        $("#" + _self.id("vol-down"), _contextDocument).mousedown(function() { $(this).css({'background-position': '-36px -33px'}); });
        $("#" + _self.id("vol-down"), _contextDocument).mouseup(function() { $(this).css({'background-position': '-18px -33px'}); });
        
        $("#" + _self.id("vol-up"), _contextDocument).hover(
            function() { $(this).css({'background-position': '-72px -33px'}); },
            function() { $(this).css({'background-position': '-54px -33px'}); }
            );
        $("#" + _self.id("vol-up"), _contextDocument).mousedown(function() { $(this).css({'background-position': '-90px -33px'}); });
        $("#" + _self.id("vol-up"), _contextDocument).mouseup(function() { $(this).css({'background-position': '-72px -33px'}); });
        
        press_and_hold($("#" + _self.id("vol-down"), _contextDocument), function() {
                handleControlClick("vol-down");
        });
        press_and_hold($("#" + _self.id("vol-up"), _contextDocument), function() {
                handleControlClick("vol-up");
        });
        	
        if(conf.youtube) {
			$("#" + _self.id("playlist.ts-save"), _contextDocument).mousedown(function() {
				$(this).css({'background-position': '-228px -199px'});
			});
			$("#" + _self.id("playlist.ts-save"), _contextDocument).mouseup(function() {
				$(this).css({'background-position': '-168px -199px'});
			});
			
			$("#" + _self.id("playlist.ts-save"), _contextDocument).hover(
				function() {
					$(this).css({'background-position': '-168px -199px','color':'#a7a7a7'});
				},
				function() {
					$(this).css({'background-position': '-108px -199px','color':'#609ebf'});
				}
			);
				
            $("#" + _self.id("yt-format"), _contextDocument).hover(
                function() { $(this).css({'color': '#C6C6C6'}); },
                function() { $(this).css({'color': '#609EBF'}); }
                );
            $("#" + _self.id("yt-format"), _contextDocument).click(function(){
                    if(_ytFormatListVisible) {
                        $("#" + _self.id("yt-formats-list")).hide();
                        _ytFormatListVisible = false;
                    }
                    else {
                        $("#" + _self.id("yt-formats-list")).show();
                        _ytFormatListVisible = true;
                    }
            });
            
            $("#" + _self.id("yt-expand"), _contextDocument).click(function() {
                    $("#page").addClass("watch-wide");
                    $("#watch-video").addClass("medium");
                    $(this).css({'background-position':'-327px -199px','top':'6px'});
                    $("#" + _self.id("yt-squeeze"), _contextDocument).css({'background-position':'-362px -199px'});
                    setTimeout(function() { onresize(true); }, 500);
                    setTimeout(function() { onresize(true); }, 1000);
                    setTimeout(function() { onresize(true); }, 1500);
            });
            
            $("#" + _self.id("yt-squeeze"), _contextDocument).click(function() {
                    $("#page").removeClass("watch-wide");
                    $("#watch-video").removeClass("medium");
                    $("#" + _self.id("yt-expand"), _contextDocument).css({'background-position':'-290px -199px','top':'5px'});
                    $(this).css({'background-position':'-394px -199px'});
					setTimeout(function() { onresize(true); }, 500);
					setTimeout(function() { onresize(true); }, 1000);
                    setTimeout(function() { onresize(true); }, 1500);
            });
            
            $("#" + _self.id("yt-formats-list") + " li").hover(
                function() { $(this).css({'text-decoration': 'underline'}); },
                function() { $(this).css({'text-decoration': 'none'}); }
                );
            
            $("#" + _self.id("yt-formats-list") + " li").click(function() {
                    if( ! $(this).hasClass("current")) {
                        $("#" + _self.id("yt-formats-list") + " li.current").each(function() {
                                $(this).removeClass("current");
                                $(this).css("color", "inherit");
                        });
                        $(this).addClass("current");
                        $(this).css("color", "#609EBF");
                        
                        var newFormat = parseInt($(this).attr("rel"));
                        $("#" + _self.id("yt-format")).html(conf.youtube.showFormats[newFormat].data.nameShort);
                        
                        ytSetCurrentFormat(newFormat, conf.youtube.showFormats[newFormat].data.quality);
                        conf.youtube.currentFormat = newFormat;
                        var url = conf.youtube.showFormats[newFormat].url;
                        _log("start_url: " + url);
                        
                        if(_player) {
                            
                            var state = _player.state(),
                                autoplay = true;
                                
                            if(state == 1 || state == 7 || state == 8) {
                                // idle, stoppped, error
                                autoplay = false;
                            }
                            
                            _player.loadUrl(url, {
                                    developerId: 0,
                                    affiliateId: 0,
                                    zoneId: 0,
                                    autoplay: false,
                                    name: conf.youtube.videoName,
                                    clearPlaylist: true
                            });
                            
                            if(autoplay) {
                                _player.play(0, {
                                        reset: false,
                                        position: 200,
                                        forcePlay: true
                                });
                            }
                        }
                    }
                    
                    $("#" + _self.id("yt-formats-list")).hide();
                    _ytFormatListVisible = false;
                    
                    return false;
            });
        } else {
			$("#" + _self.id("playlist"), _contextDocument).mousedown(function() {
                if(_player && _player.playlistSize() > 1) {
                    $(this).css({'background-position': '-499px 0'});
                }
			});
			$("#" + _self.id("playlist"), _contextDocument).mouseup(function() {
					if(_player && _player.playlistSize() > 1) {
						$(this).css({'background-position': '-473px 0'});
					}
			});
			
			$("#" + _self.id("playlist"), _contextDocument).hover(
				function() {
					if(_player && _player.playlistSize() > 1) {
						$(this).css({'background-position': '-473px 0'});
					}
				},
				function() {
					if(_player && _player.playlistSize() > 1) {
						$(this).css({'background-position': '-447px 0'});
					}
				}
			);
		}
        
        $("#" + _self.id("fullscreen"), _contextDocument).hover(
            function() {
                $(this).css({'background-position': '-389px 0'});
            },
            function() {
                $(this).css({'background-position': '-418px 0'});
            }
            );
        
        $("#" + _self.id("menu"), _contextDocument).click(function(){
                handleControlClick("menu");
        });
        
        $("." + _self.id("menu-switch"), _contextDocument).click(function(){
                showMenuPage($(this).attr("rel"));
        });
        
        $("." + _self.id("menu-switch-down"), _contextDocument).click(function() {
                var param = $(this).attr("rel");
                if(_player) {
                    var value;
                    if(param == "video-subtitle") {
                        value = _player.subtitle("prev");
                        setSubtitle(value, _player.getVideoSubtitleList());
                    }
                    else if(param == "video-aspect-ratio") {
                        value = _player.aspectRatio("prev");
                        setAspectRatio(value, _player.getVideoAspectRatioList());
                    }
                    else if(param == "video-crop") {
                        value = _player.crop("prev");
                        setCrop(value, _player.getVideoCropList());
                    }
                    else if(param == "audio-track") {
                        value = _player.audioTrack("prev");
                        setAudioTrack(value, _player.getAudioTrackList());
                    }
                    else if(param == "audio-channel") {
                        value = _player.audioChannel("prev");
                        setAudioChannel(value, _player.getAudioChannelList());
                    }
                }
        });
        
        $("." + _self.id("menu-switch-up"), _contextDocument).click(function() {
                var param = $(this).attr("rel");
                if(_player) {
                    var value;
                    if(param == "video-subtitle") {
                        value = _player.subtitle("next");
                        setSubtitle(value, _player.getVideoSubtitleList());
                    }
                    else if(param == "video-aspect-ratio") {
                        value = _player.aspectRatio("next");
                        setAspectRatio(value, _player.getVideoAspectRatioList());
                    }
                    else if(param == "video-crop") {
                        value = _player.crop("next");
                        setCrop(value, _player.getVideoCropList());
                    }
                    else if(param == "audio-track") {
                        value = _player.audioTrack("next");
                        setAudioTrack(value, _player.getAudioTrackList());
                    }
                    else if(param == "audio-channel") {
                        value = _player.audioChannel("next");
                        setAudioChannel(value, _player.getAudioChannelList());
                    }
                }
        });
        
        $("." + _self.id("menu-dd-open"), _contextDocument).click(function() {
                var param = $(this).attr("rel");
                if(param == "video-subtitle" && _player && _player.getVideoSubtitleList().length == 0) {
                    return;
                }
                else if(param == "audio-track" && _player && _player.getAudioTrackList().length == 0) {
                    return;
                }
                $("#" + _self.id("menu-popup-" + param), _contextDocument).show();
                
                var maxw = 0;
                $("#" + _self.id("menu-popup-" + param) + " li", _contextDocument).each(function() {
                        if($(this).width() > maxw) {
                            maxw = $(this).width();
                        }
                });
                if(maxw > 0) {
                    $("#" + _self.id("menu-popup-" + param) + " ul", _contextDocument).css({"width": maxw});
                }
        });
        
        $("." + _self.id("menu-popup-close"), _contextDocument).click(function() {
                $(this).parent().parent().hide();
        });
        
        $("#" + _self.id("menu-show-embed-code"), _contextDocument).click(function() {
                $("#" + _self.id("menu-popup-embed-code"), _contextDocument).show();
        });
        
        $("#" + _self.id("playlist"), _contextDocument).click(function() {
                handleControlClick("playlist");
        });
        
        $("#" + _self.id("menu-top") + " ." + _self.id("close"), _contextDocument).click(
            function() {
                showMenu(false);
            }
            );
        
        $("#" + _self.id("playlist-top") + " ." + _self.id("close"), _contextDocument).click(
            function() {
                showPlaylist(false);
            }
            );
        
        $("#" + _self.id("playlist-container") + " ." + _self.id("check-all"), _contextDocument).click(
            function(e) {
                e.preventDefault();
                var enabled,
                    $box = $("#" + _self.id("playlist-box"), _contextDocument);
                if($(this).attr("rel") == "ts-checked") {
                    enabled = false;
                    $(this).attr("rel", "ts-unchecked");
                    $(this).text(_lang.selectAll);
                    $box.find("." + _self.id("item")).removeClass("ts-checked");
                    $box.find("." + _self.id("play")).hide();
                    //$box.find("." + _self.id("check")).css({'background-position': '-346px -131px'});
                }
                else {
                    enabled = true;
                    $(this).attr("rel", "ts-checked");
                    $(this).text(_lang.unselectAll);
                    $box.find("." + _self.id("item")).addClass("ts-checked");
                    $box.find("." + _self.id("play")).show();
                    //$box.find("." + _self.id("check")).css({'background-position': '-346px -147px'});
                }
                
                var i, itemCount;
                itemCount = _player.playlistSize();
                for(i = 0; i < itemCount; i++) {
                    _player.playlistEnabled(i, enabled);
                }
            });
        
        $("#" + _self.id("playlist-prev-page"), _contextDocument).click(function(e) {
                e.preventDefault();
                
                var curr = _playlistInfo.currentPage,
                    newpage = curr - 1,
                    total = _playlistInfo.totalPages;
                if(newpage < 0 || newpage >= total) {
                    return;
                }
                
                // page selector will be updated on scroll event
                var jsp = $("#" + _self.id("playlist-box"), _contextDocument).data("jsp");
                if(jsp) {
                    jsp.scrollToY(_playlistInfo.pageHeight * newpage, true);
                }
        });
        
        $("#" + _self.id("playlist-next-page"), _contextDocument).hover(
            function() { $(this).css("background-position", "-405px -97px"); },
            function() { $(this).css("background-position", "-300px -97px"); }
            );
        $("#" + _self.id("playlist-prev-page"), _contextDocument).hover(
            function() { $(this).css("background-position", "-405px -97px"); },
            function() { $(this).css("background-position", "-300px -97px"); }
            );
        $("#" + _self.id("playlist-next-page"), _contextDocument).mousedown(
            function() { $(this).css("background-position", "-510px -97px"); }
            );
        $("#" + _self.id("playlist-next-page"), _contextDocument).mouseup(
            function() { $(this).css("background-position", "-405px -97px"); }
            );
        $("#" + _self.id("playlist-prev-page"), _contextDocument).mousedown(
            function() { $(this).css("background-position", "-510px -97px"); }
            );
        $("#" + _self.id("playlist-prev-page"), _contextDocument).mouseup(
            function() { $(this).css("background-position", "-405px -97px"); }
            );
        
        $("#" + _self.id("playlist-next-page"), _contextDocument).click(function(e) {
                e.preventDefault();
                
                var curr = _playlistInfo.currentPage,
                    newpage = curr + 1,
                    total = _playlistInfo.totalPages;
                
                if(newpage < 0 || newpage >= total) {
                    return;
                }
                
                // page selector will be updated on scroll event
                var jsp = $("#" + _self.id("playlist-box"), _contextDocument).data("jsp");
                if(jsp) {
                    jsp.scrollToY(_playlistInfo.pageHeight * newpage, true);
                }
        });
        
        // resize player when its container is resized
        $(window, _contextDocument).resize(function() {
                onresize();
        });
        
        $("#" + _self.id("progress-placeholder"), _contextDocument).draggable({
                axis: "x",
                containment: "#" + _self.id("progress-wrap"),
                start: function() {
                    _draggingProgress = true;
                    _dragStartPosition = _player.position();
                },
                drag: function(event, ui) {
                    var pos = this.offsetLeft;
                    var w = $(this).parent().width();
                    setPosition(pos / w, true);
                },
                stop: function(event, ui) {
                    _draggingProgress = false;
                    var pos = this.offsetLeft;
                    var w = $(this).parent().width();
                    handleControlClick("progress", pos / w);
                    setPosition(_player.position());
                }
        });
        
        $("#" + _self.id("progress-placeholder"), _contextDocument).mousedown(function(event){
                event.stopPropagation();
        });
        
        $("#" + _self.id("progress-wrap"), _contextDocument).mousedown(function(event){
                var pos = event.offsetX ? event.offsetX : event.pageX - $(this).offset().left;
                var w = $(this).width();
                handleControlClick("progress", pos / w);
        });
    }
    
    function updateEmbedCode()
    {
        //TODO: optimize - remember player id from showMenu() and use it here
        if( ! _player) {
            return;
        }
        
        var playerId = _player.getPlayerId();
        if( ! playerId) {
            return;
        }
        
        var embedIframe = '<iframe src="http://torrentstream.org/embed/' + playerId + '" style="width: ' + _embedInfo.width + 'px; height: ' + _embedInfo.height + 'px; border: none; background-color: #000;" frameborder="0"></iframe>';
        $("#" + _self.id("player-embed-code-iframe"), _contextDocument).val(embedIframe);
    }
    
    function attachPlaylistEventsYoutube()
    {
        // reinit jsp
        var jsp = $("#"+_self.id("playlist-box"), _contextDocument).data("jsp");
        if(jsp) {
            jsp.reinitialise();
        }
        else {
            $("#"+_self.id("playlist-box"), _contextDocument).jScrollPane({
                        verticalGutter: 0
            });
        }
    }
    
    function attachPlaylistEvents()
    {
        // reinit jsp
        var jsp = $("#"+_self.id("playlist-box"), _contextDocument).data("jsp");
        
        if(jsp) {
            $("#"+_self.id("playlist-box"), _contextDocument).removeData("jsp");
        }
        else {
            $("#"+_self.id("playlist-box"), _contextDocument).bind('jsp-scroll-y', function(event, scrollPositionY, isAtTop, isAtBottom) {
                    
                    if(_playlistInfo.totalPages < 2) {
                        return;
                    }
                    
                    if(isAtTop) {
                        playlistSetPage(0);
                        return;
                    }
                    
                    if(isAtBottom) {
                        playlistSetPage(_playlistInfo.totalPages - 1);
                        return;
                    }
                    
                    if(_playlistInfo.pageHeight > 0) {
                        var page = scrollPositionY / _playlistInfo.pageHeight;
                        page = Math.round(page);
                        if(page != _playlistInfo.currentPage) {
                            playlistSetPage(page);
                        }
                    }
            });
        }
        
        $("#"+_self.id("playlist-box"), _contextDocument).jScrollPane({
                    verticalGutter: 0
        });
        
        $("#"+_self.id("playlist-box") + " .jspPane", _contextDocument).sortable({
                start: function(event, ui) {
                    var startPos = ui.item.index();
                    _log("playlist:sortable:start: startPos=" + startPos);
                    ui.item.data("startPos", startPos);
                },
                update: function(event, ui) {
                    var startPos = ui.item.data("startPos");
                    var newPos = ui.item.index();
                    _log("playlist:sortable:update: startPos=" + startPos + " newPos=" + newPos);
                    
                    _player.playlistMoveItem(startPos, newPos);
                    
                    $("#" + _self.id("playlist-box") + " ." + _self.id("item"), _contextDocument).each(function(index) {
                            $(this).attr("fileindex", index);
                    });
                    
                    if(conf.style == "ts-white-screen") {
                        $("#torrentstream-body .playlist-box .playlist-item:even", _contextDocument).removeClass("n1").removeClass("last").addClass("n2");
                        $("#torrentstream-body .playlist-box .playlist-item:odd", _contextDocument).removeClass("n2").removeClass("last").addClass("n1");
                        $("#torrentstream-body .playlist-box .playlist-item:last", _contextDocument).addClass("last");
                    }
                }
        });
        
        $("#" + _self.id("playlist-box") + " ." + _self.id("item"), _contextDocument).hover(
            function () {
                $(this).addClass("ts-hover");
            },
            function () {
                if($(this).attr("fileindex") != _player.playlistCurrentItem()) {
                    $(this).removeClass("ts-hover");
                }
            }
            );
        
        $("#" + _self.id("playlist-box") + " ." + _self.id("check"), _contextDocument).click(
            function() {
                _log("checkbox click");
                var $item = $(this).parent().parent();
                var enabled;
                if($item.hasClass("ts-checked")) {
                    enabled = false;
                    $item.removeClass("ts-checked");
                    $item.find("." + _self.id("play")).hide();
                }
                else {
                    enabled = true;
                    $item.addClass("ts-checked");
                    $item.find("." + _self.id("play")).show();
                }
                
                var index = parseInt($item.attr("fileindex"));
                _player.playlistEnabled(index, enabled);
            });
        
        $("#" + _self.id("playlist-box") + " ." + _self.id("play"), _contextDocument).parent().click(
            function() {
                if($(this).parent().hasClass("ts-checked")) {
                    var item_pos = $(this).parent().attr("fileindex");
                    _player.play(item_pos);
                }
            });
        
        $("#"+_self.id("playlist-box") + " ." + _self.id("name"), _contextDocument)
        .scrollText({
                marginLeft: 0,
                marginRight: 16
        })
        .hover(
            function() {
                $(this).scrollText("start");
            },
            function() {
                $(this).scrollText("stop");
            }
            );
    }
    
    function syncPlaylist()
    {
        if(!_player) {
            return;
        }
        
        var items, itemCount, name, enabled, i, classChecked, checkboxBgPos, playButtonDisplay;
        
        items = _player.getPlaylistItem();
        itemCount = items.length;
        _log("syncPlaylist: itemCount=" + itemCount);
        
        for(i = 0; i < itemCount; i++) {
            name = items[i].name;
            enabled = items[i].enabled;
            
            if(enabled) {
                classChecked = " ts-checked";
                playButtonDisplay = "block";
            }
            else {
                classChecked = "";
                playButtonDisplay = "none";
            }
            
            if(enabled) {
                $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + i + "]", _contextDocument).addClass("ts-checked");
                $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + i + "] ." + _self.id("play"), _contextDocument).show();
            }
            else {
                $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + i + "]", _contextDocument).removeClass("ts-checked");
                $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + i + "] ." + _self.id("play"), _contextDocument).hide();
            }
        }
    }
    
    function initPlaylistPages()
    {
        var itemHeight, boxHeight, totalPages;
        
        if(conf.style == "ts-white-screen") {
            itemHeight = 32;
        }
        else {
            itemHeight = 34;
        }
        
        boxHeight = $("#"+_self.id("playlist-box"), _contextDocument).height();
        
        if(!boxHeight) {
            _log("initPlaylistPages: cannot get box height");
            return;
        }
        
        totalPages = Math.ceil(_player.playlistSize() * itemHeight / boxHeight);
        _log("initPlaylistPages: new_total_pages=" + totalPages + " current_total_pages=" +_playlistInfo.totalPages + " boxHeight=" + boxHeight + " itemHeight=" + itemHeight);
        
        if(conf.style == "ts-white-screen") {
            var lineHeight = Math.ceil(_player.playlistSize() * itemHeight);
            $("#" + _self.id("playlist-line-left"), _contextDocument).css("height", lineHeight + "px");
            $("#" + _self.id("playlist-line-right"), _contextDocument).css("height", lineHeight + "px");
        }
        
        if(totalPages != _playlistInfo.totalPages) {
            // reinit pages
            _log("initPlaylistPages: reinit pages");
            
            _playlistInfo.currentPage = 0;
            _playlistInfo.totalPages = totalPages;
            _playlistInfo.pageHeight = boxHeight;
            
            // pages
            $("#" + _self.id("playlist-pages"), _contextDocument).html("");
            
            if(_playlistInfo.totalPages > 1) {
                var pageClass, pageStyle, pageHtml;
                for(var i = 0; i < _playlistInfo.totalPages; i++) {
                    pageClass = "ts-page";
                    if(i == _playlistInfo.currentPage) {
                        pageClass += " ts-selected";
                    }
                    
                    if(conf.style == "ts-white-screen") {
                        if(i < conf.playlistMaxPages) {
                            pageStyle = ' style="display:inline;"';
                        }
                        else {
                            pageStyle = ' style="display:none;"';
                        }
                        pageHtml = '<a href="#"><b>' + (i+1) + '</b></a>';
                    }
                    else {
                        pageHtml = "";
                        pageStyle = "";
                    }
                    
                    var $page = $('<li class="' + pageClass + '"' + pageStyle + ' rel="' + i + '">' + pageHtml + '</li>', _contextDocument);
                    $page.click(function() {
                            var newpage = $(this).attr("rel");
                            var jsp = $("#" + _self.id("playlist-box"), _contextDocument).data("jsp");
                            if(jsp) {
                                jsp.scrollToY(_playlistInfo.pageHeight * newpage, true);
                            }
                            return false;
                    });
                    $("#" + _self.id("playlist-pages"), _contextDocument).append($page);
                }
                $("#" + _self.id("playlist-pages-container"), _contextDocument).show();
            }
            else {
                $("#" + _self.id("playlist-pages-container"), _contextDocument).hide();
            }
        }
        
        if(_browser.name == "ie") {
            fixIEplaylist();
        }
    }
    
    function playlistSetPage(page)
    {
        _log("playlistSetPage(page=" + page + ")");
        $("#" + _self.id("playlist-pages") + " .ts-page[rel=" + _playlistInfo.currentPage + "]", _contextDocument).removeClass("ts-selected");
        $("#" + _self.id("playlist-pages") + " .ts-page[rel=" + page + "]", _contextDocument).addClass("ts-selected");
        _playlistInfo.currentPage = page;
        
        $("#" + _self.id("playlist-pages") + " .ts-page", _contextDocument).css("display", "none");
        page = parseInt(page);
        var leftC = page - 2;
        if(page == _player.playlistSize() - 1) {
            leftC -= 2;
        }
        if(page == _player.playlistSize() - 2) {
            leftC -= 1;
        }
        
        var rightC = page + 2;
        if(page == 0) {
            rightC += 2;
        }
        if(page == 1) {
            rightC += 1;
        }
        
        for(var j = leftC; j <= rightC; j++) {
            $("#" + _self.id("playlist-pages") + " .ts-page[rel=" + j + "]", _contextDocument).css("display", "inline");
        }
    }
    
    function updateMediaSettings()
    {
        if(!_player) {
            return;
        }
        
        var videoAspectRatioList = _player.getVideoAspectRatioList(),
            videoCropList = _player.getVideoCropList();
            videoSubtitleList = _player.getVideoSubtitleList(),
            audioChannelList = _player.getAudioChannelList(),
            audioTrackList = _player.getAudioTrackList();
        
        setControlOptions("video-aspect-ratio", videoAspectRatioList);
        setControlOptions("video-crop", videoCropList);
        setControlOptions("video-subtitle", videoSubtitleList);
        setControlOptions("audio-channel", audioChannelList);
        setControlOptions("audio-track", audioTrackList);
        
        setSubtitle(_player.getVideoSubtitle(), videoSubtitleList);
        setAudioTrack(_player.getAudioTrack(), audioTrackList);
        setAudioChannel(_player.getAudioChannel(), audioChannelList);
        setAspectRatio(_player.getVideoAspectRatio(), videoAspectRatioList);
        setCrop(_player.getVideoCrop(), videoCropList);
    }
    
    this.id = function(suffix) {
        return suffix ? _uniqueId + "_" + suffix : _uniqueId;
    };
    
    this.getPluginContainer = function() {
        _log("getPluginContainer: id=" + _self.id("content"));
        return _contextDocument.getElementById(_self.id("content"));
    };
    
    this.attachPlayer = function(player) {
        _player = player;
        updateMediaSettings();
        if(_forceAutoplay) {
            _log("attachPlayer: force autoplay");
            _player.play();
        }
    };
    
    // event handlers
    this.onSystemMessage = function(msg)
    {
        if(msg == "notify_version_1_0_5" && TorrentStream.Utils.getCookie("__ts_sn104") !== undefined) {
            _log("onSystemMessage: skip notify_version_1_0_5");
            return;
        }
        showIframeMessage(msg);
    };
    
    this.onMessage = function(type, msg) {
        //_log("onMessage: type=" + type + " msg=" + msg);
        
        var delay = 0;
        if(type == "alert") {
            delay = 2000;
        }
        else if(type == "error") {
            delay = -1;
        }
        
        if(_lang[msg] !== undefined) {
            msg = _lang[msg];
        }
        
        showMsg(msg, delay);
    };
    
    this.onStatus = function(status) {
        var type = "message", msg = "";
        
        if(status) {
            if(status.status === "idle") {
                msg = "";
            }
            else if(status.status === "err") {
                type = "error";
                msg = status.errorMessage;
            }
            else if(status.status === "dl") {
                if(_player) {
                    try {
                        msg = _player.getPlaylistItem(_player.playlistCurrentItem()).name;
                    }
                    catch(e) {
                    }
                }
            }
            else if(status.status === "check") {
                msg = _lang.msgChecking.replace("{progress}", status.progress);
            }
            else if(status.status === "prebuf") {
                msg = _lang.msgPrebuffering;
                msg = msg.replace("{progress}", status.progress);
                msg = msg.replace("{peer_count}", status.peers);
            }
            else if(status.status === "buf") {
                msg = _lang.msgBuffering;
                msg = msg.replace("{progress}", status.progress);
                msg = msg.replace("{peer_count}", status.peers);
            }
            else if(status.status === "wait") {
                msg = _lang.msgWaiting.replace("{time}", formatDuration(status.time));
            }
        }
        
        _self.onMessage(type, msg);
        
        if(typeof conf.onStatus === 'function') {
            conf.onStatus.call(this, status);
        }
    };
    
    this.onTime = function(index, time, formatted) {
        if(!formatted) {
            time = formatDuration(time);
        }
        setDuration(time);
    };
    
    this.onDuration = function(index, duration) {
        _log("onDuration: index=" + index + " duration=" + duration);
    };
    
    this.onProgress = function(index, progress) {
        if(!_draggingProgress) {
            setPosition(progress);
        }
    };
    
    this.onStart = function(index)
    {
        if(_showBigPlayButton) {
            $("#" + _self.id("big-play-button"), _contextDocument).hide();
        }
        
        if(conf.style == "ts-white-screen") {
            $("#torrentstream-body .player-controls .button-play", _contextDocument).data("state", "play").css("background-position", "-99px 0px");
        }
        else {
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "]", _contextDocument).addClass("ts-hover");//css({'background': 'transparent url(' + imgSpriteBg1 + ') repeat-x 0 -525px'});
            $("#" + _self.id("play"), _contextDocument).css({'background-position': '-198px -33px'});
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "] ." + _self.id("play"), _contextDocument).css({'background-position': '-319px -45px'});
        }
        
        updateMediaSettings();
        
        if(typeof conf.onStart === 'function') {
            conf.onStart.call(this, index);
        }
    };
    
    this.onBuffering = function(index) {
        _log("onBuffering: index=" + index);
    };
    
    this.onChecking = function(index) {
        _log("onChecking: index=" + index);
    };
    
    this.onPrebuffering = function(index)
    {
        _log("onPrebuffering: index=" + index);
        showMsg("");
        
        if(_showBigPlayButton) {
            $("#" + _self.id("big-play-button"), _contextDocument).hide();
        }
        
        if(conf.style == "ts-white-screen") {
            $("#torrentstream-body .playlist-item[fileindex!=" + index + "] .playlist-play", _contextDocument).css("background-position", "-224px -229px");
            $("#torrentstream-body .playlist-item[fileindex=" + index + "] .playlist-play", _contextDocument).css("background-position", "-241px -229px");
            $("#torrentstream-body .player-controls .button-power", _contextDocument).css({'background-position': '-490px -34px'});
        }
        else {
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "]", _contextDocument).addClass("ts-hover");//css({'background': 'transparent url(' + imgSpriteBg1 + ') repeat-x 0 -525px'});
            $("#" + _self.id("play"), _contextDocument).css({'background-position': '-198px -33px'});
            $("#"+_self.id("power"), _contextDocument).css({'background-position': '-573px 0'});
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "] ." + _self.id("play"), _contextDocument).css({'background-position': '-319px -45px'});
        }
    };
    
    this.onPause = function(index)
    {
        if(conf.style == "ts-white-screen") {
            $("#torrentstream-body .player-controls .button-play", _contextDocument).data("state", "pause").css("background-position", "0px 0px");
            $("#torrentstream-body .playlist-item[fileindex=" + index + "] .playlist-play", _contextDocument).css("background-position", "-224px -229px");
            $("#torrentstream-body .player-controls .button-power", _contextDocument).css({'background-position': '-507px -34px'});
        }
        else {
            $("#" + _self.id("play"), _contextDocument).css({'background-position': '-168px -33px'});
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "] ." + _self.id("play"), _contextDocument).css({'background-position': '-329px -45px'});
        }
    };
    
    this.onResume = function(index)
    {
        if(_showBigPlayButton) {
            $("#" + _self.id("big-play-button"), _contextDocument).hide();
        }
        
        if(conf.style == "ts-white-screen") {
            $("#torrentstream-body .player-controls .button-play", _contextDocument).data("state", "play").css("background-position", "-99px 0px");
            $("#torrentstream-body .playlist-item[fileindex=" + index + "] .playlist-play", _contextDocument).css("background-position", "-241px -229px");
            $("#torrentstream-body .player-controls .button-power", _contextDocument).css({'background-position': '-490px -34px'});
        }
        else {
            $("#" + _self.id("play"), _contextDocument).css({'background-position': '-198px -33px'});
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "] ." + _self.id("play"), _contextDocument).css({'background-position': '-319px -45px'});
        }
    };
    
    this.onStop = function(index, fullstop)
    {
        showMsg(fullstop ? _lang.downloadingStopped : _lang.playingStopped);
        updateMediaSettings();
        
        if(conf.style == "ts-white-screen") {
            $("#torrentstream-body .player-controls .button-play", _contextDocument).data("state", "stop").css("background-position", "0px 0px");
            $("#torrentstream-body .playlist-item[fileindex=" + index + "] .playlist-play", _contextDocument).css("background-position", "-224px -229px");
            $('#torrentstream-body .player-duration', _contextDocument).hide();
            if(fullstop) {
                $("#torrentstream-body .player-controls .button-power", _contextDocument).css({'background-position': '-507px -34px'});
            }
        }
        else {
            //$("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "]", _contextDocument).css({'background-image': 'none'});
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "]", _contextDocument).removeClass("ts-hover");
            $("#" + _self.id("playlist-box") + " ." + _self.id("item") + "[fileindex=" + index + "] ." + _self.id("play"), _contextDocument).css({'background-position': '-329px -45px'});
            $("#" + _self.id("play"), _contextDocument).css({'background-position': '-168px -33px'});
            if(fullstop) {
                $("#"+_self.id("power"), _contextDocument).css({'background-position': '-551px 0'});
            }
        }
        
        if(typeof conf.onStop === 'function') {
            conf.onStop.call(this, index, fullstop);
        }
    };
    
    this.onCompleted = function(index) {
        _log("onCompleted: index=" + index);
        if(typeof conf.onCompleted === 'function') {
            conf.onCompleted.call(this, index);
        }
    };
    
    this.onVolume = function(newVolume)
    {
        showMsg("Volume " + newVolume + "%", 750);
    };
    
    this.onMute = function(muted)
    {
        _log("onMute: muted=" + muted);
        
        if(conf.style == "ts-white-screen") {
            if(muted) {
				$("#torrentstream-body .player-controls .button-sound", _contextDocument).addClass("off").attr('title', _lang.volumeOn);//css({'background-position': '-473px -33px'});
            }
            else {
                $("#torrentstream-body .player-controls .button-sound", _contextDocument).removeClass("off").attr('title', _lang.volumeOff);//css({'background-position': '-456px -34px'});
            }
        }
        else {
            if(muted) {
                $("#"+_self.id("vol-switch"), _contextDocument).attr("title", _lang.volumeOn).addClass("off");//.css({'background-position': '-108px -33px'});
            }
            else {
                $("#"+_self.id("vol-switch"), _contextDocument).attr("title", _lang.volumeOff).removeClass("off");//.css({'background-position': '-124px -33px'});
            }
        }
    };
    
    this.onPlaylist = function(files)
    {
        if(conf.style == "internal") {
            return;
        }
        
        if(conf.youtube) {
            attachPlaylistEventsYoutube();
            return;
        }
        
        var itemId, itemName, rowClass;
        $("#"+_self.id("playlist-box"), _contextDocument).html("");
        for(i = 0; i < files.length; i++) {
            itemId = i;
            itemName = files[i];
            
            if(conf.style == "ts-white-screen") {
                rowClass = (i % 2 == 0) ? "n1" : "n2";
                if(i == (files.length - 1)) {
                    rowClass += " last";
                }
                $("#torrentstream-body .playlist-box", _contextDocument).append(
                    '<div class="playlist-item ts-checked ' + rowClass + ' ' + _self.id("item") + '" fileindex="' + i + '" rel="' + itemId + '">'+
                        '<div class="playlist-col-check">'+
                            '<div class="playlist-check ' + _self.id("check") + '"></div>'+
                        '</div>'+
                        '<div class="playlist-col-name ' + _self.id("name") + '">'+
                            '<div class="text-scroll-container">'+
                                '<span class="text-scroll-inner">' + itemName + '</span>'+
                            '</div>'+
                        '</div>'+
                        '<div class="playlist-col-actions">'+
                            '<div class="playlist-play ' + _self.id("play") + '"></div>'+
                        '</div>'+
                    '</div>'
                    );
            }
            else {
                // ts-black
                $("#"+_self.id("playlist-box"), _contextDocument).append(
                    '<div class="ts-item ' + _self.id("item") + ' ts-checked" fileindex="' + i + '" rel="' + itemId + '">'+
                    '<div class="ts-check-container">'+
                    '<div class="ts-check ' + _self.id("check") + '"></div>'+
                    '</div>'+
                    '<div class="ts-name ' + _self.id("name") + '">'+
                    '<div class="ts-text-scroll-container text-scroll-container">'+
                    '<span class="ts-text-scroll-inner text-scroll-inner">' + itemName + '</span>'+
                    '</div>'+
                    '</div>'+
                    '<div class="ts-actions ' + _self.id("actions") + '">'+
                    '<div class="ts-playlist-play ' + _self.id("play") + '"></div>'+
                    '</div>'+
                    '</div>'
                );
            }
        }
        
        attachPlaylistEvents();
        initPlaylistPages();
    };
    
    this.setYoutubeFormats = function(formats) {
        for(var i = 0; i < formats.length; i++) {
            $("#"+_self.id("playlist-box"), _contextDocument).append(
                '<div class="ts-item ' + _self.id("item") + ' ts-checked">'+
                '<div style="left: 0; cursor: auto;" class="ts-name ' + _self.id("name") + '">'+
                '<div class="ts-text-scroll-container text-scroll-container">'+
                '<span class="ts-text-scroll-inner text-scroll-inner">' + formats[i].data.nameFull + '</span>'+
                '</div>'+
                '</div>'+
                '<a href="' + formats[i].url + '" title="' + _lang.download + '">'+
                '<div class="ts-actions ' + _self.id("actions") + '">'+
                '<div class="ts-playlist-save"></div>'+
                '</div>'+
                '</a>'+
                '</div>'
            );
        }
    };
    
    this.onMediaLoaded = function() {
        if(_player) {
            
            if(conf.style == "internal") {
                return;
            }
            
             _log("onMediaLoaded: playlist size is " + _player.playlistSize());
            if(_player.playlistSize() > 1) {
                showPlaylist(true);
            }
        }
        else {
             _log("onMediaLoaded: no player");
        }
    };
    
    this.destroyPlayer = function() {
        if(_player) {
            try {
                _log("destroyPlayer: ---");
                _player.destroy();
                _player = null;
                showPlaylist(false);
                showMenu(false);
                setPosition(0);
                setDuration("");
                displayMsg("");
            }
            catch(e) {
                _log("destroyPlayer:exc: " + e);
            }
        }
    };
    
    this.showPlayer = function(callback) {
        if(conf.style != "ts-white-screen") {
            throw "showPlayer() can only be used on popup player";
        }
        openScreen(callback);
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // init
    var defaultConf = {
        style: "ts-black",
        cufonEnabled: true,
        playlistMaxPages: 10,
        iframeCommunication: "hash",
        lang: null,
        langId: "auto",
        debug: false
    };
    conf = TorrentStream.Utils.extend(defaultConf, conf);
    _lang = TorrentStream.Utils.extend(_lang, conf.lang);
    _browser = TorrentStream.Utils.detectBrowser();
    var availablePlugin = TorrentStream.Utils.detectPlugin();
    
    if(conf.style == "internal" && availablePlugin != 2 && availablePlugin != 3) {
        _log("init: cannot use internal controls, fallback to ts-black");
        conf.style = "ts-black";
    }
    
    if(conf.youtube) {
        var _ytFormatListVisible = false;
    }
    
    if(conf.style == "ts-white-screen") {
        _defaultMenuRightWidth = _menuRightWidth = 262;
        _contentPreviewRect.width = 208;
        _contentPreviewRect.height = 112;
        _contentPreviewRect.top = 105;
        _pluginWidth = 681;
        _pluginHeight = 460;
    }
    
    _contextDocument = conf._contextDocument || document;
    if(_contextDocument.defaultView !== undefined) {
        if(conf.iframeCommunication == "direct") {
            _location = _contextDocument.defaultView.location;
        }
        else {
            _location = _contextDocument.defaultView.top.location;
        }
    }
    else {
        if(conf.iframeCommunication == "direct") {
            _location = window.location;
        }
        else {
            _location = top.location;
        }
    }
    _uniqueId = makeId();
    
    // create controls
    if(conf.style == "ts-white-screen") {
        createPopupPlayer();
        attachWhiteScreenEvents();
    }
    else if(conf.style == "internal") {
        conf.cufonEnabled = false;
        _showBigPlayButton = false;
        createContainer();
    }
    else {
        initCss();              
        createContainer();
        createControls();
        attachControlsEvents();
        attachCommonEvents();
        onresize();
    }
    
    if(conf.youtube) {
        try {
            _self.setYoutubeFormats(conf.youtube.allFormats);
        }
        catch(e) {
            _log("Cannot set youtube formats: " + e);
        }
    }
    
    if(conf.cufonEnabled) {
        try {
            TorrentStream.Cufon.now();
        }
        catch(e) {
        }
    }
    
    if(!_infowindowVisible) {
        if(_showBigPlayButton) {
            $("#" + _self.id("big-play-button"), _contextDocument).show();
        }
    }
};
