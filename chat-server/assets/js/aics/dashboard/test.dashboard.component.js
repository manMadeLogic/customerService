angular.module('aics')
    .component('dashboard', {
        templateUrl: './assets/js/aics/dashboard/dashboard.template.html',
        controller: function DashBoardController($scope, $timeout, sharedService) {

            // TODO: this should be false by default
            // keep it to true until you implement the flows
            // so you can see the chatbox in the meantime
            $scope.inConversation = true;
            //$scope.inConversation = false;
            $scope.messages = [];
            $scope.engagedUser = {
                name: 'Anonymous',
                userId: ''
            };

            var socket = io();
            var agentId = sharedService.getProfile().agentId;

            // send the agent profile to the chat server
            socket.emit('handshake', JSON.stringify(sharedService.getProfile()));

            socket.on(agentId, function(message) {
                console.log('received message from user');

                try {
                    let json = JSON.parse(message);

                    $scope.messages.push({
                        text: json.text,
                        position: 'right'
                    });

                    $scope.$apply();
                } catch (error) {
                    console.log('message format error', error);
                }
            });

            const sendMessage = function(message) {
                console.log('sending message');

				if (message && message.trim().length > 0) {
					console.log('message:' + message);
					$scope.messages.push({
						text: message,
						position: 'left'
					});
					//if ($scope.engagedUserId) {
						socket.emit(agentId, message);
					//}
				}
            };

            $scope.keyListener = function(keyEvent) {
                if (keyEvent.which !== 13) {
                    return;
                }
                console.log('enter pressed');

                const message = $('.chat-input').val();
				//if (message && message.value && message.value.trim().length > 0) {
					$('.chat-input').val('');

					sendMessage(message);
				//}
			};

            $scope.sendButtonPressed = function() {
                console.log('send button pressed');

                const message = $('.chat-input').val();
				
				//if (message && message.value && message.value.trim().length > 0) {
					$('.chat-input').val('');

					sendMessage(message);
				//}
            };
        }
    });
