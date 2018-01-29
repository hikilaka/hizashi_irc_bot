const Vision = require('@google-cloud/vision');
const c = require('irc-colors');
const ztable = require('ztable');

const network = require('./network');
const config = require('./config');

let client = new network.client.HizashiClient(config);
let vision = Vision();

function likelihoodOrdinal(likelihood) {
    return Vision.types.Likelihood[likelihood];
}

function decorateLikelihood(subject, likelihood) {
    switch (likelihoodOrdinal(likelihood)) {
        case Vision.types.Likelihood.VERY_LIKELY:
            return subject;
        case Vision.types.Likelihood.LIKELY:
            return `likely ${subject}`;
        case Vision.types.Likelihood.POSSIBLE:
            return `possible ${subject}`;
    }
}

function formatConfidence(confidence) {
    confidence *= 100.00;

    if (confidence >= 95) {
        return c.lime(confidence.toFixed(1) + '%');
    } else if (confidence >= 90) {
        return c.green(confidence.toFixed(1) + '%');
    } else if (confidence >= 75) {
        return c.yellow(confidence.toFixed(1) + '%');
    } else if (confidence >= 50) {
        return c.olive(confidence.toFixed(1) + '%');
    } else if (confidence >= 25) {
        return c.red(confidence.toFixed(1) + '%');
    } else {
        return c.brown(confidence.toFixed(1) + '%');
    }
}

function formatSafeSearch(result) {
    if (!result.safeSearchAnnotation) {
        return null;
    }
    
    const nouns = {
        adult: 'nudity',
        spoof: 'offensive',
        medical: 'gore',
        violence: 'violence'
    };
    const subjects = Object.keys(nouns);

    result = subjects.map(subject => decorateLikelihood(nouns[subject], result.safeSearchAnnotation[subject]))
                     .filter(result => result);

    // none of the subjects are possible or likely
    if (result.length === 0) {
        return null;
    }
    return c.red('[[')+'NSFW '+c.red('-')+' '+result.join(c.red(' // '))+c.red(']]');
}

function formatText(result) {
    if (result.textAnnotations.length === 0) {
        return null;
    }
    const text = result.textAnnotations[0].description.replace(/\n/g, ' ').substring(0, 100).trim();
    return c.aqua('[')+'Text '+c.aqua('-')+' '+text+c.aqua(']');
}

function formatWeb(result) {
    if (!result || !result.webDetection) {
        return null;
    }
    if (result.webDetection.webEntities.length === 0) {
        return null;
    }

    result = result.webDetection.webEntities
                .filter(e => e.description.length > 0)
                .map(e => e.description+' '+formatConfidence(ztable(e.score)));

    if (result.length > 4) {
        result.length = 4;
    }
    return c.aqua('[')+'Web '+c.aqua('-')+' '+result.join(c.aqua(' / '))+c.aqua(']');
}

function formatLabel(result) {
    if (!result || !result.labelAnnotations) {
        return null;
    }
    if (result.labelAnnotations.length === 0) {
        return null;
    }
    result = result.labelAnnotations
                .filter(e => e.description.length > 0)
                .map(e => e.description+' '+formatConfidence(ztable(e.score)));

    if (result.length > 4) {
        result.length = 4;
    }
    return c.aqua('[')+'Labels '+c.aqua('-')+' '+result.join(c.aqua(' / '))+c.aqua(']');

}

function formatFace(result) {
    if (result.faceAnnotations.length === 0) {
        return null;
    }

    // TODO: mess with determined emotions

    if (result.faceAnnotations.length === 1) {
        return c.aqua('[')+'Found 1 face'+c.aqua(']');
    } else {
        return c.aqua('[')+'Found '+result.faceAnnotations.length+' faces' + c.aqua(']');
    }
}

client.on('privmsg', event => {
    const match = event.message.match(/(http|https):\/\/[\w-]+(\.[\w-]+)+[\w.,@?^=%&amp;:/~+#-]*(jpg|jpeg|png)([\w@?^=%&amp;/~+#-]+)?/i);

    if (!match) {
        return;
    }

    let request = {
        image: {
            source: {
                imageUri: match[0]
            }
        },
        features: [
            { type: Vision.v1.types.Feature.Type.SAFE_SEARCH_DETECTION },
            { type: Vision.v1.types.Feature.Type.TEXT_DETECTION },
            { type: Vision.v1.types.Feature.Type.WEB_DETECTION },
            { type: Vision.v1.types.Feature.Type.LABEL_DETECTION },
            { type: Vision.v1.types.Feature.Type.LOGO_DETECTION },
            { type: Vision.v1.types.Feature.Type.FACE_DETECTION }
        ]
    };

    vision.batchAnnotateImages({requests: [request]}).then(response => {
        if (response.length === 0) {
            return event.reply(c.bold.red('cannot determine image properties'));
        }

        if (!response[0] || response[0].responses.length === 0 || !response[0].responses[0]) {
            return;
        }
        
        const mutators = [
            formatSafeSearch, formatText,
            formatWeb, formatLabel, formatFace
        ];

 //       console.log(formatFace(response[0].responses[0]));
        event.reply(mutators.map(f => f(response[0].responses[0]))
                            .filter(r => r).join(' '));
    }).catch(error => {
        event.reply(c.bold.red('Error: ') + error);
        console.error(error);
    });
});

client.on('error', error => console.error(error));

client.connect(() => {
    console.log('connected to server');
});
