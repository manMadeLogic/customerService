from __future__ import print_function
#import json
import base64
import boto3
import time

aws_id = "AKIAJIVWV6V2AYU7X6UQ"
aws_key = "UrHw/ZG+Se4hL9JCT0ULV9cdMiqr0MiJ9wcIdgGI"
region = 'us-east-1'
table_name = 'user-context'

def lambda_handler(event, context):
    for record in event['Records']:
       #Kinesis data is base64 encoded so decode here
       payload=base64.b64decode(record["kinesis"]["data"])

       data = payload.split("/")
       # validatation
       if(len(data) != 2):
           return

       user_id = payload.split("/")[0]
       location = payload.split("/")[1]

       # print("Decoded payload: " + str(payload))
       dynamodb = boto3.resource('dynamodb', region_name=region, aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
       table = dynamodb.Table(table_name)
       response = table.put_item(
          Item={
               'user_id': user_id,
               'location': location,
               'validated': True,
               'ttl':int(time.time())+10
               }
           )
