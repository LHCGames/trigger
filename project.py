from project_module import project_object, image_object, link_object, challenge_object

p = project_object('trigger', 'Trigger game')
p.domain = 'http://www.aidansean.com/'
p.path = 'trigger'
p.preview_image_ = image_object('http://placekitten.com.s3.amazonaws.com/homepage-samples/408/287.jpg', 408, 287)
p.folder_name = 'LHCGames'
p.github_repo_name = 'trigger'
p.mathjax = True
p.links.append(link_object(p.domain, p.path, 'Live page'))

p.introduction = 'Like the <a href="">Science Shift Simulator</a>, this is a game that emerged as a subset of the <a href="http://aidansean.com/projects/?p=543">aDetector</a> project.  The player has to save events that match the criteria given, just like a trigger does in real life.  The results are then combined across all the players in a given team to determine the final score.  The scores can be combined across experiments to make a "discovery".  This is still in development, which will continue over the net week and months.'
p.overview = '''This is another cooperative multiplayer game aimed at showing the public (especially high school pupils) how particle physics research actually takes place.  Any number of players can take part and they are split into "Team ATLAS" and "Team CMS".  The score of each team is determined by the performance of the players on each "shift" they take at the trigger, and the final scores are combined for the discovery of the Higgs boson.  There is also a "spy" mode where people can see the events as they are submitted.'''

p.challenges.append(challenge_object('This project needs an attractive, fast, and realistic detector model.', 'Having already developed a decent detector model for the aDetector project, I simply used a two dimensional version for this project.  I then split the detector finely in \(\eta\) and \(\phi\) to make interactions between the particles and detector easier.  The aesthetics went through a few iterations before settling on the final design.  However further optimisations and aesthetic changes are anticipated as development continues.', 'Resolved, to be revisited.'))

p.challenges.append(challenge_object('This game puts a bit of a strain on my server.', 'My web space uses a shared server, so sometimes many HTTP requests from the same client looks like a Denial Of Service (DOS) attack, resulting in a throttling of the requests.  There are two main strategies to overcome this.  The first option is to bundle up several requests into one request, reducing the total number of requests, and the load on the server.  This solution has not been implemented yet.  The second option is to change the server settings.  I do not have access to these, but as development continues I intend to move to a different server that can handle so many very small requests.', 'To be revisited.'))

p.challenges.append(challenge_object('This game needs cross platform and cross device support.', 'This game was initially intended to be played with an iPad, but I did not have an iPad for testing.  On the day of the release of the game I had to tweak the settings so the response times were slower with respect to mouse events to make it easier to play on a tablet device.  These settings are trivially changed to allow multiple device support.', 'Resolved.'))

p.challenges.append(challenge_object('The game should be repsonsive to the inputs of the user.', 'Initially the game did not confirm success when a user clicked on the screen and this lead to confusion.  As a result I had to add a big green "tick" for success and a big red "cross" for failure to inform the user of the status of the event.', 'Resolved.'))

p.challenges.append(challenge_object('The game needed an animated histogram for the final result.', 'I\'ve made histogras before, including histograms that update themselves on the aDetector project, but until now I had not animated a histogram.  This was a bit tricky as I had to call events which were using the <tt>this</tt> keyword, so the histogram object had to be stored as a global variable because, although I\'d like to, I couldn\'t use <tt>this</tt> to refer to the histgoram.  Javascript can be frustating like that.', 'Resolved.'))

