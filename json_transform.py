#!/usr/bin/python2
import json
import requests
import csv
import MySQLdb
import os

db = MySQLdb.connect(host = '192.168.0.111',
                     user = os.getenv("DBUSER"),
                     passwd = os.getenv("DBPASS"),
                     db = 'wny_votes')

cur = db.cursor()

f = open("getElectedOfficials.json", "r")
jsonString = f.read();
jsonDat = json.loads(jsonString)

offices = {}

def getMuni(districtName):
    return districtName.replace("Town of ","").replace("Village of ","").replace("Judges","").replace(" Family Court","").replace(" Officials","").replace("City of ","").replace(" City","")

for district in jsonDat["districts"]:
    for office in district["offices"]:
        if office["district"]["level"]["id"] > 2:

            # Get informatio about the office
            r = requests.get('http://www.elections.erie.gov/ce/mobile/seam/resource/rest/voter/getelectedofficial?officeId='+str(office["id"]))
            officeJSON = json.loads(r.text[5:-1])

            try:
                firstName = officeJSON["person"]["firstName"]
                middleName = officeJSON["person"]["middleName"]
                lastName = officeJSON["person"]["lastName"]
                phoneNumber = officeJSON["person"]["phoneNumber"]
                emailAddress = officeJSON["person"]["emailAddress"]
                address = " ".join([officeJSON["person"]["address"]["address1"],
                            officeJSON["person"]["address"]["address2"],
                            officeJSON["person"]["address"]["city"],
                            officeJSON["person"]["address"]["state"],
                            officeJSON["person"]["address"]["zip"]])

                website = officeJSON["office"]["website"]
                order = office["district"]["level"]["sortOrder"]
                
                if "officeHolder" in officeJSON["office"]:
                    party = officeJSON["office"]["officeHolder"]["politicalParty"]["partyAbbreviation"]
                else:
                    party = " "

                offices[office["id"]] = [getMuni(district["name"]),
                                         office["internalDisplay"],
                                         firstName,
                                         middleName,
                                         lastName,
                                         phoneNumber,
                                         emailAddress,
                                         address,
                                         website,
                                         party,
                                         order
                                        ]

                if phoneNumber == "":
                    phoneNumber = None;
                if emailAddress == "":
                    emailAddress = None;
                lastName = lastName.replace("'", "")


                query = "INSERT INTO offices VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', '{9}', '{10}');".format(getMuni(district["name"]),
                                         office["internalDisplay"],
                                         firstName,
                                         middleName,
                                         lastName,
                                         phoneNumber,
                                         emailAddress,
                                         address,
                                         website,
                                         party,
                                         str(order))
                print(query) 
                cur.execute(query)
                db.commit()


                #print(",".join(offices[office["id"]]))
            except KeyError:
                pass

db.close()

