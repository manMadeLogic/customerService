from __future__ import print_function

import json
import base64
import boto3
from boto3.dynamodb import conditions

aws_id = "AKIAJIVWV6V2AYU7X6UQ"
aws_key = "UrHw/ZG+Se4hL9JCT0ULV9cdMiqr0MiJ9wcIdgGI"
bucket_name = 'cloud-computing-images'
region = 'us-east-1'
table_name = 'user-image'

def compare_faces(decoded_image, bucket_name, target_name, threshold, region):
    # print (decoded_image)
    rekognition = boto3.client('rekognition', region, aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
    response = rekognition.compare_faces(
    SourceImage = {
        'Bytes':decoded_image
        },
    TargetImage = {
        'S3Object': {
            'Bucket':bucket_name,
            'Name':target_name
        }
        },
    SimilarityThreshold = threshold,
    )
    return response['SourceImageFace'], response['FaceMatches']

def lambda_handler(event, context):

    encoded_image = event['base64Image']
    decoded_image = base64.b64decode(encoded_image)

    threshold = 80
    # user_id = 'dac'
    user_id = event['userId']
    print (user_id)
    key_name = user_id

    dynamodb = boto3.resource('dynamodb', region_name=region, aws_access_key_id=aws_id, aws_secret_access_key=aws_key)
    table = dynamodb.Table(table_name)
    response = table.query(
    KeyConditionExpression=conditions.Key('user_id').eq(user_id)
    )
    target_name = response['Items'][0]['image_url'].split("/")[4]

    source_face, matches= compare_faces(decoded_image, bucket_name, target_name, threshold, region)
    print (matches[0]['Similarity'])
    if int(matches[0]['Similarity'])>80:
        data = { 'tokenId': 'AD78hdjjuUIIdkklppPPp00dauyd78', 'expiration' : 900}
        return data
    else:
        data = { 'tokenId': '', 'expiration' : 0}
        return data
