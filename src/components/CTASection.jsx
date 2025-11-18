import React from 'react';
import { ContactCard } from './ui/contact-card';
import { MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export function CTASection() {
	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission
		console.log('Form submitted');
	};

	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-6xl">
					<ContactCard
						title="Get in Touch"
						description="Need help choosing the right hardware for your project? Our expert team is here to assist you. Fill out the form and we'll respond within 1 business day."
						contactInfo={[
							{
								icon: MailIcon,
								label: 'Email',
								value: 'info@athukoralatraders.lk',
							},
							{
								icon: PhoneIcon,
								label: 'Phone',
								value: '+94 11 234 5678',
							},
							{
								icon: MapPinIcon,
								label: 'Address',
								value: '123 Hardware Street, Colombo 03',
								className: 'col-span-2',
							}
						]}
					>
						<form onSubmit={handleSubmit} className="w-full space-y-4">
							<div className="flex flex-col gap-2">
								<Label className="text-gray-700">Name</Label>
								<Input 
									type="text" 
									placeholder="Your name"
									className="border-gray-300"
									required
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label className="text-gray-700">Email</Label>
								<Input 
									type="email" 
									placeholder="your@email.com"
									className="border-gray-300"
									required
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label className="text-gray-700">Phone</Label>
								<Input 
									type="tel" 
									placeholder="+94 XX XXX XXXX"
									className="border-gray-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label className="text-gray-700">Message</Label>
								<Textarea 
									placeholder="Tell us about your project..."
									className="border-gray-300"
									rows={4}
									required
								/>
							</div>
							<Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
								Send Message
							</Button>
						</form>
					</ContactCard>
				</div>
			</div>
		</section>
	);
}
