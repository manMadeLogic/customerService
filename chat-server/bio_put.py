from __future__ import print_function

import base64
import boto3

aws_id = "AKIAJIVWV6V2AYU7X6UQ"
aws_key = "UrHw/ZG+Se4hL9JCT0ULV9cdMiqr0MiJ9wcIdgGI"
bucket_name = 'cloud-computing-images'
region = 'us-east-1'
table_name = 'user-image'

def percent_cb(complete, total):
    sys.stdout.write('.')
    sys.stdout.flush()

def lambda_handler(event, context):

    encoded_image = event['base64Image']
    decoded_string = base64.b64decode(encoded_image)
    # user_id = 'dac'
    user_id = event['userId']
    key_name = user_id + '.jpeg'
    s3 = boto3.resource('s3', aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
    s3.Bucket(bucket_name).put_object(Key=key_name, Body=decoded_string)

    image_url = "https://s3.amazonaws.com/{0}/{1}".format(bucket_name,key_name)

    dynamodb = boto3.resource('dynamodb', region_name=region, aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
    table = dynamodb.Table(table_name)
    response = table.put_item(
       Item={
            'user_id': user_id,
            'image_url': image_url
            }
        )
