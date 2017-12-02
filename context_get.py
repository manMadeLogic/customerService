from __future__ import print_function

import base64
import boto3
from boto3.dynamodb import conditions

aws_id = "AKIAJIVWV6V2AYU7X6UQ"
aws_key = "UrHw/ZG+Se4hL9JCT0ULV9cdMiqr0MiJ9wcIdgGI"
region = 'us-east-1'
table_name = 'user-context'

def lambda_handler(event, context):


    user_id = 'dac'
    # user_id = event['userId']

    dynamodb = boto3.resource('dynamodb', region_name=region, aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
    table = dynamodb.Table(table_name)
    response = table.query(
    KeyConditionExpression=conditions.Key('user_id').eq(user_id)
    )
    items = response['Items']
    # location = [0]['location']
    events = []
    for item in items:
        data = {
            'location':item['location'],
            'validated':item['validated']
        }
        events.append(data)

    return {'events':events}
