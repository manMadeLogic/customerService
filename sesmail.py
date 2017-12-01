import boto3
import os
import uuid
import json
from aylienapiclient import textapi
from botocore.exceptions import ClientError
# Replace sender@examplie.com with your "From" address.
# This address must be verified with Amazon SES.
tclient = textapi.Client("fadccfb8", "741b4b59ad46d230f6596473fcfcd575")

SENDER = "ciciphus <highwizardassassin@163.com>"

# Replace recipient@example.com with a "To" address. If your account 
# is still in the sandbox, this address must be verified.
RECIPIENT = "ciciphus.apply@gmail.com"

# Specify a configuration set. If you do not want to use a configuration
# set, comment the following variable, and the 
# ConfigurationSetName=CONFIGURATION_SET argument below.

#CONFIGURATION_SET = "ConfigSet"

# If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
AWS_REGION = "us-east-1"

client = boto3.client('ses',region_name=AWS_REGION,
                       aws_access_key_id='AKIAJ5WTK7H6QR7EGTGQ',
                       aws_secret_access_key = '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')
s3 = boto3.resource('s3',region_name=AWS_REGION, 
                       aws_access_key_id='AKIAJ5WTK7H6QR7EGTGQ',
                       aws_secret_access_key = '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')
bucket = s3.Bucket('bookchat1')
#for key in bucket.objects.all():
#    name =  key.key
def handler(event, context):
    for record in event['Records']:
        name = record['s3']['object']['key']  
        download_path = '/tmp/{}'.format(name) 
        s3.Bucket('bookchat1').download_file(name, download_path)
        with open(download_path, 'r') as f:
            data = json.load(f)
        RECIPIENT = data["name"]
        text = data["messages"] 
        
        print(text)
        
        sentiment = tclient.Sentiment({'text':text})
        
        analysis = sentiment['polarity'] + " " + sentiment['subjectivity']
        # The subject line for the email.
        SUBJECT = "Amazon SES Test (SDK for Python)"
        
        # The email body for recipients with non-HTML email clients.
        BODY_TEXT = ("\n").join(text)+("\n") + ("sentiment analysis:") + analysis
                    
        # The HTML body of the email.
        BODY_HTML = """<html>
        <head></head>
        <body>
          <h1>Amazon SES Test (SDK for Python)</h1>
          <p>This email was sent with
            <a href='https://aws.amazon.com/ses/'>Amazon SES</a> using the
            <a href='https://aws.amazon.com/sdk-for-python/'>
              AWS SDK for Python (Boto)</a>.</p>
        </body>
        </html>
                    """            
        
        # The character encoding for the email.
        CHARSET = "UTF-8"
        
        # Create a new SES resource and specify a region.
        
        # Try to send the email.
        
        
        try:
            #Provide the contents of the email.
            response = client.send_email(
                Destination={
                    'ToAddresses': [
                        RECIPIENT,
                    ],
                },
                Message={
                    'Body': {
                        #'Html': {
                        #    'Charset': CHARSET,
                        #    'Data': BODY_HTML,
                        #},
                        'Text': {
                            'Charset': CHARSET,
                            'Data': BODY_TEXT,
                        },
                    },
                    'Subject': {
                        'Charset': CHARSET,
                        'Data': SUBJECT,
                    },
                },
                Source=SENDER,
                # If you are not using a configuration set, comment or delete the
                # following line
         #       ConfigurationSetName=CONFIGURATION_SET,
            )
        
        
        
        
        # Display an error if something goes wrong.	
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent! Message ID:"),
            print(response['ResponseMetadata']['RequestId'])
        
        
        
        
        
