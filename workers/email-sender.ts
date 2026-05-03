// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export interface SendEmailParams {
	to: string | string[];
	from: string | { email: string; name: string };
	subject: string;
	html?: string;
	text?: string;
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string | { email: string; name: string };
	attachments?: any[];
	headers?: Record<string, string>;
}

export async function sendEmail(
	env: any, // 【关键修改】：这里从 binding 改成了 env，这样才能读到 API Key
	params: SendEmailParams,
): Promise<{ messageId: string }> {
	
	// 1. 格式化发件人和收件人
	const fromAddress = typeof params.from === "string" ? params.from : params.from.email;
	const toArray = Array.isArray(params.to) ? params.to : [params.to];

	// 2. 发起 Resend 请求
	// 加上这两行用来排错的日志
	console.log("--- 环境变量诊断 ---");
	console.log("Key 是否存在？", !!env.RESEND_API_KEY);
	console.log("Key 的前缀是：", env.RESEND_API_KEY ? env.RESEND_API_KEY.substring(0, 5) : "获取失败！是空的！");
	
	// 下面是你原来的发信代码
	const res = await fetch('https://api.resend.com/emails', {
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: fromAddress, // 你的日志显示这里是 admin@aiemail.cc.cd
			to: toArray,
			subject: params.subject,
			html: params.html,
			text: params.text,
			headers: params.headers
		}),
	});

	if (!res.ok) {
		const errorText = await res.text();
		console.error("Resend 拦截报错:", errorText);
		throw new Error(`Resend Error: ${errorText}`);
	}

	const data = await res.json();
	// 返回 Resend 生成的 messageId，如果没有则随机生成一个
	return { messageId: (data as any).id || crypto.randomUUID() };
}
