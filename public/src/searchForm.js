function main() {
    $('#form').submit(function (e) {
        e.preventDefault();

        const $emailHelpContainer = $('#emailHelp')[0];
        const userEmail = $('#userEmail')[0].value
        const unSupportedEmailDomains = ['gmail', 'yahoo', 'hotmail', 'outlook'];

        if (!isEmail(userEmail) || !!unSupportedEmailDomains.find(d => userEmail.includes(d))) {
            $emailHelpContainer.innerText = 'Invalid/Unsupported email.';
            $emailHelpContainer.style = 'color: red !important';
            return;
        }

        $emailHelpContainer.innerHTML = '';
        const loader = $('#loader')[0];
        loader.style = 'display: block; width: 4rem; height: 4rem;';
        $('#results')[0].style = 'display: none';

        let url = `/api/v1/websites_data/search/form`;

        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({
                userName: $('#userName')[0].value || '',
                userEmail,
                domain: $('#domain')[0].value || '',
                queryLive: $('#isLiveQuery').is(':checked'),
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            processData: false,
            contentType: false,
            success: (data) => {
                console.log(data);
                writeResults(data);
            },
            fail: (e) => {
                const loader = $('#loader')[0];
                loader.style = 'display: none';
                $('#errorContainer')[0].textContent = 'Something went wrong, please try again later';
            }
        });
    });
};

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
};

const getTitleCaseFromCamelCase = (t) => {
    const result = t.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
};

function writeResults(results) {
    const resultsContainer = $('#results')[0];

    const loader = $('#loader')[0];
    loader.style = 'display: none';

    if (!results.length) {
        const messageEl = document.createElement('p');
        messageEl.innerHTML = '<strong>No results found for domain, try enabling live query!</strong>';
        resultsContainer.appendChild(messageEl);
        resultsContainer.style = 'display: block; width: 40%; margin-top: 5vh; margin-left: 30.5%; color: red;';
        $('#resultsTable')[0].style = 'display: none';
        return;
    }

    const resultTableElement = document.querySelector('#resultsTable');
    resultTableElement.innerHTML = '<thead><tr><th>Field</th><th>Value</th><th>Comment</th></tr></thead>';

    const fieldsToHide = ['backgroundRequests', 'perfTiming', 'searchRequestDetails'];

    Object.values(results[0]).forEach(k => {
        if (fieldsToHide.includes(k.field) || !k.value) {
            return;
        }

        if (k.hasOwnProperty('disableField') && k.disableField) {
            return;
        }

        const row = document.createElement('tr');
        const d1 = document.createElement('td');
        const d2 = document.createElement('td');
        const d3 = document.createElement('td');

        d1.innerHTML = k.displayName;
        if (k.isLink) {
            const anc = document.createElement('a');
            anc.href = k.value;
            anc.textContent = 'Click Here!';
            d2.appendChild(anc);
        } else {
            d2.textContent = k.value;
        }
        d3.innerHTML = k.comment || '';

        if (k.sentiment) {
            row.style = `background-color: ${k.sentiment};`;
        }

        if (k.helperText) {
            const icn = document.createElement('i');
            icn.setAttribute('class', 'fa fa-question-circle');
            icn.title = k.helperText;
            icn.style = 'margin-left: 2px;'
            d1.appendChild(icn);
            d1.title = k.helperText;
        }

        // if (['divIdMain', 'divClassMain', 'consoleContent', 'backgroundRequests', 'cookies'].includes(k)) {
        //     const ifr = document.createElement('iframe');
        //     let html = '';
        //     if (['backgroundRequests', 'cookies'].includes(k)) {
        //         const requestLists = results[0][k] && results[0][k].split(';').map(r => `<li>${r.replace('[status', ' -> [status')}</li>`);
        //         html = `<ul>${(requestLists || []).join('\n')}</ul>`;
        //     } else {
        //         html = results[0][k];
        //     }
        //     ifr.srcdoc = `<html><body>${html}</body></html>`;
        //     d2.appendChild(ifr);
        // } else {
        //     d2.innerText = results[0][k];
        // }

        row.appendChild(d1);
        row.appendChild(d2);
        row.appendChild(d3);
        resultTableElement.appendChild(row);
    });

    resultsContainer.style = 'display: block';
};

main();
