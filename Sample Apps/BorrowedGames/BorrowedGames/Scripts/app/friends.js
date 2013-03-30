﻿modit('friends', ['growl'], function (growl) {
    var view = {
        modal: null,
        showFriendsLink: null,
        closeFriendsButton: null,
        closeFriendsButtonTop: null,
        handleTextBox: null,
        addHandleButton: null,
        friendsContainer: null,
        handleAttribute: null,
        friendSelectorById: function (handle) { return 'tr[' + this.handleAttribute + '="' + handle + '"]'; },
        init: function () {
            this.modal = $("#friends");
            this.showFriendsLink = $("#showFriends");
            this.closeFriendsButton = $("#closeFriends");
            this.closeFriendsButtonTop = $("#closeFriendsTop");
            this.handleTextBox = $("#handleToAdd");
            this.addHandleButton = $("#addHandle");
            this.friendsContainer = $("#handles");
            this.handleAttribute = "data-handle";
        }
    };

    var addFriendUrl;
    var listFriendsUrl;
    var deleteFriendUrl;

    function init(urls) {
        addFriendUrl = urls.addFriendUrl;

        listFriendsUrl = urls.listFriendsUrl;

        deleteFriendUrl = urls.deleteFriendUrl;

        view.init();

        view.modal.modal('hide');

        view.showFriendsLink.click(function () { show(); });

        var closeLogic = function () {
            if (view.friendsContainer.find("tr").length != 0) {
                view.showFriendsLink.html('view users you are following');
                view.showFriendsLink.removeClass("btn-danger").addClass("btn-info")
            }
            else {
                view.showFriendsLink.html("you aren't following anyone, click to add");
                view.showFriendsLink.removeClass("btn-info").addClass("btn-danger")
            }

            view.modal.modal('hide');
        };

        view.closeFriendsButton.click(closeLogic);

        view.closeFriendsButtonTop.click(closeLogic);

        view.addHandleButton.click(function () { addHandle(); });

        view.handleTextBox.bind('keypress', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);

            if (code == 13) addHandle();
        });
    }

    function show() {
        view.modal.modal('show');

        load();
    }

    function addHandle() {
        var handle = view.handleTextBox.val();

        if (handle.indexOf('@') < 0) handle = '@' + handle;

        $.post(addFriendUrl, { handle: handle },
        function (d) {
            if (d.added) {
                view.friendsContainer.append($friendRecordFor(handle).hide().fadeIn('slow'));
            }

            view.handleTextBox.val('');
            growl.info(d.message, view.handleTextBox.offset().top - 5);

            refreshGames();
        });
    }

    function $friendRecordFor(handle) {
        var $friend = $("<td style='width: 100%'>" + handle + "</td>");
        $friend.attr(view.handleAttribute, handle);

        $links = $("<td></td>");

        $links.append($deleteLinkFor(handle));

        return $("<tr></tr>").attr(view.handleAttribute, handle).append($friend).append($links);
    }

    function $deleteLinkFor(handle) {
        var $deleteLink = $("<a href='javascript:;' class='btn btn-danger'>remove</a>");
        $deleteLink.attr(view.handleAttribute, handle);

        $deleteLink.click(function () { removeHandle(handle); });

        return $deleteLink;
    }

    function removeHandle(handle) {
        $.post(deleteFriendUrl, { handle: handle }, function () {
            $friend = $findFriend(handle);

            $friend.fadeOut('fast', function () { $friend.remove(); });

            refreshGames();
        });
    }

    function $findFriend(handle) {
        return view.friendsContainer.find(view.friendSelectorById(handle));
    }

    function load() {
        view.friendsContainer.html('');

        $.getJSON(listFriendsUrl, function (handles) {
            for (var i in handles) {
                view.friendsContainer.append($friendRecordFor(handles[i]));
            }
        });
    }

    function refreshGames() {
      refreshPreferredGames();
      refreshWantedGames();
    }

    function refreshPreferredGames() {
        preferred.getPreferredGames();
    }

    function refreshWantedGames() {
        wanted.getWantedGames();
    }

    this.exports(init);
});
