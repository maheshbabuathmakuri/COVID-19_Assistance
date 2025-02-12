# COVID-19_Assistance
<b>COVID-19 Assistance chat bot by using Machine learning/Artificial intelligence, dockerized the application and  deployed into Google Cloud Platform(GCP).</b><br>
<img src='COVID19_Assistant.gif'>
<br>
<b>Below are the features of the application:</b>
  * The bot can assist most of the FAQ's answered by WHO.
                (such as what is corona virus, what is self-isolation, can corona spreads from pets etc…)                         
  * It provides the police helpline contacts in states.
                (Police helplines in telangana<state name>)
  * It can assist testing lab centers in states
                (Please show testing labs in andhra pradesh)
  * It helps you with the details of COVID-19 treatment hospitals in a state.
                (corona virus treatment hospitals in telangana)
  * It assists senior citizen helpline numbers.
                (Can you help for senior citizen helpline in kerala)
  * It gives the history of number of confirmed/recovered/death cases on daily incremental wise and total cases in India..
                (recovered cases on 15th may, total recovered cases on 14th may)
  * It gives the number of active/recovered/deaths/confirmed cases in state-wise.
                (Please tell me total active cases in andhra pradesh)

 <br>
 <h5>The application looks like below.</h5>
 <b>The UI is created using UI5(Javascript framework). Chatbot created using RASA</b>
 <img src='image1.png'>  <img src='image2.png'>  <img src='image3.png'>
 
# Rasa Deployment
Deploying Rasa Bot over Google Cloud Platform using Docker.

## Prerequisites:
- Docker
- Docker Compose


## Instructions:

### For deploying locally:

- clone this repository
- run the below command within the project directory:
>  docker-compose up --build

- Check whether the services are up and running using below command:
> docker ps -a

- test out the bot in the browser
> http://localhost


### For deploying over GCP Compute Engine:
- Create the VM instance of Ubuntu over Compute Engine
- once the instance is created login to the VM using SSH
- Run the below commands and clone our Docker app:

 - > sudo apt-get update
 
#### Install Docker

- > curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add 
- > sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
- > sudo apt-get update
- >  apt-cache policy docker-ce
- > sudo apt-get install -y docker-ce
- > sudo systemctl status docker
     
#### Install [Docker-Compose](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-16-04)

- > sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

- > sudo chmod +x /usr/local/bin/docker-compose
- > docker-compose --version

#### Clone the Docker App

- > git clone https://github.com/maheshbabuathmakuri/COVID-19_Assistance
- > cd COVID-19_Assistance

#### Build the Docker app and run the services:

- > docker-compose up --build

- Check whether the services are up and running using below command:
- > docker ps -a

- Once you see all the services up and running, open the ip address of the machine in the browser and test the bot

