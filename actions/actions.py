# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/core/actions/#custom-actions/


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
from rasa_sdk.forms import FormAction
import requests
from datetime import datetime
from dateutil.parser import parse

MONTHS = {"01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July"}

class SearchCoronaCasesHistory(Action):
    """This action class finds and displays the search_coronacases entity slot."""

    def name(self) -> Text:
        """Unique identifier of the action"""

        return "find_corona_cases_history"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:
        
        e_time = next(tracker.get_latest_entity_values("time"), None)
        status = next(tracker.get_latest_entity_values("status"), None).lower()
        
        response = ""
        if e_time != None:
            print("Calling api")
            response = requests.get('https://api.covid19india.org/data.json').json()
            print("Called api and got the response successfully")
            print("entity of time", e_time)
            print("entity of status", status)
        	
            total = ""
            try:
                total = next(tracker.get_latest_entity_values("total"), "")
            except:
                total = ""
            #final_status_history = status_history.replace(" ", "")
            fin_status_history = ""
            print("status entity is: ", status)
            print("time entity is: ", e_time)
            print("total is: ", total)
            
            if "total" in total:
                print("inside total")
                if "confirm" in status:
                    fin_status_history = "totalconfirmed"
                elif "decease" in status:
                    fin_status_history = "totaldeceased"
                elif "death" in status:
                    fin_status_history = "totaldeceased"
                elif "recover" in status:
                    fin_status_history = "totalrecovered"
            else:
                if "confirm" in status:
                    fin_status_history = "dailyconfirmed"
                elif "decease" in status:
                    fin_status_history = "dailydeceased"
                elif "death" in status:
                    fin_status_history = "dailydeceased"
                elif "recover" in status:
                    fin_status_history = "dailyrecovered"
            print(fin_status_history)
            
            dt = parse(e_time)
            time = str(dt).split(" ")
            date = time[0].split("-")[2]
            month = time[0].split("-")[1]
            search_month = int(month)
            search_date = int(date) 
            month = MONTHS[month]
            final_date = date + "" + month
    
            s_history_data = response["cases_time_series"]
            history_data = []
            for i in s_history_data:
                i["date"] = i["date"].replace(" ","")
                history_data.append(i)
            response = ""
            
            
            today_date = datetime.today().strftime('%Y-%m-%d').split("-")
            curr_date = today_date[2]
            curr_month = today_date[1]
            year = 2020
            hist_date = datetime(year, 1, 30)
            todaydt = datetime(year, int(curr_month), int(curr_date))
            search_datedt = datetime(year, search_month, search_date)
            
            if (search_datedt >= todaydt) or (search_datedt < hist_date):
                response = "Data is not available. Kindly refrain the search querry."
            else:
                for i in history_data:
                    print(i["date"])
                    print("final_date is", final_date )
                    if i["date"] == final_date:
                        print("date matched")
                        #print("Type of Status: " + type(status))
        #                count = i[status]
                        if "total" in total:
                            response = "Total {} cases as on {} is {}".format(status, time[0], i[fin_status_history])
                            break
                            #response = "Total {} cases in India is {}".format(status, i[status])
                        else:
                            response = "Daily {} cases on {} is {}".format(status, time[0], i[fin_status_history])
                            break
        elif e_time == None:
            response = requests.get('https://api.covid19india.org/data.json').json()
        
            state = next(tracker.get_latest_entity_values("state"), None).title()
            status = next(tracker.get_latest_entity_values("status"), None).lower()
            #state = next((e for e in tracker.latest_message.entities if e['entity'] == 'state'), None).title()
            #state = next(tracker.get_latest_entity_values("status")).Title()
            #state = tracker.get_slot("state").Title()
            if state == "India":
                state = "Total"
            
            if "decease" in status or "death" in status:
                status = "deaths"
            
            #status = next((e for e in tracker.latest_message.entities if e['entity'] == 'status'), None).lower()
             #status = next(tracker.get_latest_entity_values("status")).lower()
            #status = tracker.get_slot("status").lower()
            
            statewisedata = response["statewise"]
            response = ""
            for i in statewisedata:
                if i["state"] == state:
                    #print("Type of Status: " + type(status))
    #                count = i[status]
                    if state == "Total":
                        response = "Total {} cases in India is {}".format(status, i[status])
                    else:
                        response = "Total {} cases in {} is {}".format(status, state, i[status])

                
                
        dispatcher.utter_message(text= response)
        return []




class FindEssentials(Action):
    """This action class finds and displays the search_coronacases entity slot."""

    def name(self) -> Text:
        """Unique identifier of the action"""

        return "find_essentials"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:
        state = None
        essentialtype = None
        response = None
        data = requests.get("https://api.covid19india.org/resources/resources.json").json()
        results = data["resources"]
        state = next(tracker.get_latest_entity_values("state"), None).title()
        essentialtype = next(tracker.get_latest_entity_values("essentialtype"), None).lower()
        #state = next((e for e in tracker.latest_message.entities if e['entity'] == 'state'), None).title()
        #state = next(tracker.get_latest_entity_values("status")).Title()
        #state = tracker.get_slot("state").Title()
        print("state is", state)
        print("essential type is", essentialtype)
        
        if "lab" in essentialtype:
            essentialtype = "CoVID-19 Testing Lab"
        elif "hospital" in essentialtype:
            essentialtype = "Hospitals and Centers"
        elif "police" in essentialtype:
            essentialtype = "Police"
        elif "senior" in essentialtype:
            essentialtype = "Senior Citizen Support"
        
        
        
        def myFilter(item):
          if item["category"] == essentialtype and item["state"] == state:
            return True
          else:
            return False
        
        filteredList = list(filter(myFilter, results))
        print("filter list is",filteredList)
        
        #status = next((e for e in tracker.latest_message.entities if e['entity'] == 'status'), None).lower()
         #status = next(tracker.get_latest_entity_values("status")).lower()
        #status = tracker.get_slot("status").lower()
        
        #statewisedata = response["statewise"]
        
        testing_lab_counter = 1
        hospital_counter = 1
        police_counter = 1
        senior_citizen_counter = 1
        if essentialtype == "CoVID-19 Testing Lab":
            if len(filteredList) >= 1:
                response = "Testing lab: " + str(testing_lab_counter) + "\n"
                for i in filteredList:
                    if testing_lab_counter !=1:
                        response = response + "\n \n" +  "Testing lab: " + str(testing_lab_counter) + "\n"
                    testing_lab_counter = testing_lab_counter+1
                    response = response + "\t  &bull; City: {} \n  \t &bull; Description: {} \n \t &bull; Organisation: {}  \n \t &bull; Phone no. : {}".format(i["city"], i["descriptionandorserviceprovided"], i["nameoftheorganisation"], i["phonenumber"])
            else:
                response = "I am Sorry. Currently, i dont have data for your search query."
        elif essentialtype == "Hospitals and Centers":
            if len(filteredList) >= 1:
                response = "Hospital : " + str(hospital_counter) + "\n"
                for i in filteredList:
                    if hospital_counter !=1:
                        response = response + "\n \n" +  "Hospital: " + str(hospital_counter) + "\n"
                    hospital_counter = hospital_counter+1
                    response = response + "\t  &bull; City: {} \n  \t &bull; Hospital Name: {} \n \t &bull; Description: {}  \n \t &bull; Phone no. : {}".format(i["city"], i["nameoftheorganisation"], i["descriptionandorserviceprovided"], i["phonenumber"])
            else:
                response = "Regret for inconvenience. Iam not able to assist you for your search"
        elif essentialtype == "Police":
            if len(filteredList) >= 1:
                response = "Police contact : " + str(police_counter) + "\n"
                for i in filteredList:
                    if police_counter !=1:
                        response = response + "\n \n" +  "Police Contact: " + str(police_counter) + "\n"
                    police_counter = police_counter+1
                    response = response + "\t  &bull; City: {} \n  \t &bull; Police Station: {} \n \t &bull; Description: {}  \n \t &bull; Phone no. : {}".format(i["city"], i["nameoftheorganisation"], i["descriptionandorserviceprovided"], i["phonenumber"])
            else:
                response = "Iam collecting data for it. Please come back after sometime"
        elif essentialtype == "Senior Citizen Support":
            if len(filteredList) >= 1:
                response = "Seior citizen support : " + str(senior_citizen_counter) + "\n"
                for i in filteredList:
                    if senior_citizen_counter !=1:
                        response = response + "\n \n" +  "Seior citizen support: " + str(senior_citizen_counter) + "\n"
                    senior_citizen_counter = senior_citizen_counter+1
                    response = response + "\t  &bull; City: {} \n  \t &bull; Organisation: {} \n \t &bull; Description: {}  \n \t &bull; Phone no. : {}".format(i["city"], i["nameoftheorganisation"], i["descriptionandorserviceprovided"], i["phonenumber"])
            else:
                response = "Iam collecting data for it. Please come back after sometime"

        
        
        dispatcher.utter_message(text= response)
        return []

class SearchCoronaCases(Action):
    """This action class finds and displays the search_coronacases entity slot."""

    def name(self) -> Text:
        """Unique identifier of the action"""

        return "find_corona_cases"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:
        state = None
        status = None
        '''entities = tracker.latest_messages["entities"]
        for e in entities:
            if e["entity"] == "state":
                state = e["value"].Title()
            if e["entity"] == "status":
                status = e["value"].lower()'''
        response = requests.get('https://api.covid19india.org/data.json').json()
        
        state = next(tracker.get_latest_entity_values("state"), None).title()
        status = next(tracker.get_latest_entity_values("status"), None).lower()
        #state = next((e for e in tracker.latest_message.entities if e['entity'] == 'state'), None).title()
        #state = next(tracker.get_latest_entity_values("status")).Title()
        #state = tracker.get_slot("state").Title()
        if state == "India":
            state = "Total"
        
        if "decease" in status or "death" in status:
            status = "deaths"
        
        #status = next((e for e in tracker.latest_message.entities if e['entity'] == 'status'), None).lower()
         #status = next(tracker.get_latest_entity_values("status")).lower()
        #status = tracker.get_slot("status").lower()
        
        statewisedata = response["statewise"]
        response = ""
        for i in statewisedata:
            if i["state"] == state:
                #print("Type of Status: " + type(status))
#                count = i[status]
                if state == "Total":
                    response = "Total {} cases in India is {}".format(status, i[status])
                else:
                    response = "Total {} cases in {} is {}".format(status, state, i[status])
        
        
        dispatcher.utter_message(text= response)
        return []


