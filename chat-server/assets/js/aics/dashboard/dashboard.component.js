angular.module('aics')
    .component('dashboard', {
        templateUrl: './assets/js/aics/dashboard/dashboard.template.html',
        controller: function DashBoardController($scope, $timeout, sharedService) {


            var socket = io();
            var agentId = sharedService.getProfile().agentId;
            // keep it to true until you implement the flows
            // so you can see the chatbox in the meantime
            //$scope.inConversation = true;
			$scope.inConversation = false;
            // send the agent profile to the chat server
            socket.emit('agentHandshake', JSON.stringify(sharedService.getProfile()));

		    socket.on('openChat', function(userObj) {
				console.log(`dashboard received handshake for user`, userObj);
				$scope.inConversation = true;
            // TODO: this should be false by default
			// if(sharedService.getProfile().userId){
				// onsole.log('conversation exist');
				// $scope.inConversation = true;
				// $scope.messages = [];
				// $scope.engagedUser = {
					// name: sharedService.getProfile().userName,
					// userId: sharedService.getProfile().userId
				// };
			// }
			});
			
            socket.on(agentId, function(message) {
                console.log('received message from user');
				$scope.inConversation = true;
				$scope.messages = [];
				$scope.engagedUser = {
					name: '',
					userId: ''
				};//sharedService.getProfile().userId
				//sharedService.getProfile().userName

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

				if (message && message.trim().length > 0) {
					console.log('message:' + message);
					$scope.messages.push({
						text: message,
						position: 'left'
					});
					if ($scope.engagedUserId) {
						socket.emit(agentId, message);
					}
				}
            };

            $scope.keyListener = function(keyEvent) {
                if (keyEvent.which !== 13) {
                    return;
                }
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
			
            $scope.openChat = function() {
                console.log('openChat button pressed');
				socket.emit('openChat', ' {"agentId":"c60e3e44-bd0f-77ab-90ce-a37ce3128fe0","name":"xi"}');
            };
        }
    });
