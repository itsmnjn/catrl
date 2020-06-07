if [[ $# -eq 0 ]] ; then
    echo 'Please specify the stage with ./deploy.sh <stage>'
    exit 1
fi

serverless deploy --aws-profile catrl  --stage ${1} -v